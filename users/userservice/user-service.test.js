const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./user-model');

let mongoServer;
let app;


beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./user-service');
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

describe('User Service', () => {
  it('should add a new user on POST /user', async () => {
    const newUser = {
      username: 'testuser',
      password: 'Testpassword12345678',
      name: 'testname',
      surname:'testsurname'
    };

    const response = await request(app).post('/user').send(newUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');
    expect(response.body).toHaveProperty('name', 'testname');
    expect(response.body).toHaveProperty('surname', 'testsurname');

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: 'testuser' });

    // Assert that the user exists in the database
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('testuser');

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare('Testpassword12345678', userInDb.password);
    expect(isPasswordValid).toBe(true);
  });

  it('should not add a user if username already exists', async () => {
 
    const existingUser = {
      username: 'testuser',
      password: 'Testpassword12345678',
      name: 'Existing',
      surname: 'User',
    };
  
    // First attempt: user is created successfully
    await request(app).post('/user').send(existingUser);

    // Second attempt: same username, should fail
    const response = await request(app).post('/user').send(existingUser);

    // Check that the status code is 400 (or whatever your backend uses for duplicates)
    expect(response.status).toBe(400);

    // Check that an error message is received in the "error" field
    expect(response.body).toHaveProperty('error'); // The error message should be in 'error'
    
    // Check that the error message indicates the username already exists
    expect(response.body.error).toBe('Invalid username'); 

  });

  it('should return error if username is less than 4 characters long', async () => {
    const newUser = {
      username: 'abc',  // Username is less than 4 characters
      password: 'Testpassword12345678',
      name: 'Short',
      surname: 'User',
    };
  
    // Send the request to create the user
    const response = await request(app).post('/user').send(newUser);

    // Check that the status code is 400 (or whatever your backend uses for validation errors)
    expect(response.status).toBe(400);

    // Check that the error message is returned in the "error" field
    expect(response.body).toHaveProperty('error');

    // Check that the error message is specific to the username
    expect(response.body.error).toBe('The username must be at least 4 characters long');
  });

  it('should return error if password is less than 8 characters long', async () => {
    const newUser = {
      username: 'testuser1',
      password: 'short',  
      name: 'Test',
      surname: 'User'
    };
  
    const response = await request(app).post('/user').send(newUser);
  
    // Check that the status code is 400 (error)
    expect(response.status).toBe(400);
  
    // Check that the error message is returned in the "error" field
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('The password must be at least 8 characters long');
  });

  it('should return error if password does not contain numeric character', async () => {
    const newUser = {
      username: 'testuser2',
      password: 'shortttt',  
      name: 'Test',
      surname: 'User'
    };
  
    const response = await request(app).post('/user').send(newUser);
  
    // Check that the status code is 400 (error)
    expect(response.status).toBe(400);
  
    // Check that the error message is returned in the "error" field
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('The password must contain at least one numeric character');
  });

});
