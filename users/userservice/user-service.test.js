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
      surname: 'testsurname'
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

  it('The password must contain at least one uppercase letter', async () => {
    const newUser = {
      username: 'testuser2',
      password: 'shortttt1',
      name: 'Test',
      surname: 'User'
    };

    const response = await request(app).post('/user').send(newUser);

    // Check that the status code is 400 (error)
    expect(response.status).toBe(400);

    // Check that the error message is returned in the "error" field
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('The password must contain at least one uppercase letter');
  });

  it('The name cannot be empty or contain only spaces', async () => {
    const newUser = {
      username: 'testuser2',
      password: 'Shortttt1',
      name: '',
      surname: 'User'
    };

    const response = await request(app).post('/user').send(newUser);

    // Check that the status code is 400 (error)
    expect(response.status).toBe(400);

    // Check that the error message is returned in the "error" field
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('The name cannot be empty or contain only spaces');
  });

  it('The surname cannot be empty or contain only spaces', async () => {
    const newUser = {
      username: 'testuser2',
      password: 'Shortttt1',
      name: 'test',
      surname: ''
    };

    const response = await request(app).post('/user').send(newUser);

    // Check that the status code is 400 (error)
    expect(response.status).toBe(400);

    // Check that the error message is returned in the "error" field
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('The surname cannot be empty or contain only spaces');
  });

  it('should return the user profile when the user exists', async () => {
    const user = new User({
      username: 'testProfile',
      password: 'Password1234567',
      name: 'Test',
      surname: 'User',
    });
    await user.save();

    const response = await request(app).get('/user/profile/testProfile');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testProfile');
    expect(response.body).toHaveProperty('name', 'Test');
    expect(response.body).toHaveProperty('surname', 'User');

    expect(response.body).not.toHaveProperty('password');
  });

  it('should return an error when the user does not exist', async () => {
    const response = await request(app).get('/user/profile/noexistuser');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'No se encontró el usuario "noexistuser".');
  });

  it('should update the user profile when the user exists', async () => {
    const user = new User({
      username: 'testUserProfileOld',
      password: 'Password12345678',
      name: 'OldName',
      surname: 'OldSurname',
      profilePicture: 'http://old-picture.com',
      description: 'Old description',
    });
    await user.save();
  
    const updatedProfile = {
      name: 'NewName',
      surname: 'NewSurname',
      profilePicture: 'http://new-picture.com',
      description: 'New description',
    };
  
    const response = await request(app)
      .put('/user/update/profile/testUserProfileOld')
      .send(updatedProfile);
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'NewName');
    expect(response.body).toHaveProperty('surname', 'NewSurname');
    expect(response.body).toHaveProperty('profilePicture', 'http://new-picture.com');
    expect(response.body).toHaveProperty('description', 'New description');
  
    const updatedUser = await User.findOne({ username: 'testUserProfileOld' });
    expect(updatedUser.name).toBe('NewName');
    expect(updatedUser.surname).toBe('NewSurname');
    expect(updatedUser.profilePicture).toBe('http://new-picture.com');
    expect(updatedUser.description).toBe('New description');
  });

});
