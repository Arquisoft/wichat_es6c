const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');

// Close the app after all tests are done
afterAll(async () => {
  app.close();
});

// Mock axios
jest.mock('axios');

describe('Gateway Service', () => {
  // Set up mocked responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/user/')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/ask')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  // Test /health endpoint
  it('should respond with status 200 for /health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  // Test /login endpoint with valid credentials
  it('should forward /login request to auth service', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'Newpassword1234567' });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe('mockedToken');
  });

  // Test /login endpoint with invalid credentials
  it('should /login return 401 if credentials are invalid', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { error: 'Invalid credentials' }
      }
    });

    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'wrongPassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  // Test /user endpoint
  it('should forward add user request to user service', async () => {
    const response = await request(app)
      .post('/user')
      .send({
        username: 'newuser',
        password: 'Newpassword1234567',
        name: 'newname',
        surname: 'newsurname'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe('mockedUserId');
  });

  it('should handle /user errors and respond with appropriate status and message', async () => {
    // Mock the user service to return a 400 error (e.g., username already exists)
    axios.post.mockImplementationOnce(() =>
      Promise.reject({
        response: {
          status: 400,
          data: { error: 'Username already exists' }
        }
      })
    );
  
    // Send the request to the gateway
    const response = await request(app).post('/user').send({
      username: 'testuser',
      password: 'Password1234',
      name: 'Test',
      surname: 'User'
    });
  
    // Expect the status code to be forwarded correctly
    expect(response.status).toBe(400);
  
    // Expect the error message to be returned properly
    expect(response.body).toHaveProperty('error', 'Username already exists');
  });
  

  // Test /askllm endpoint
  it('should forward askllm request to the LLM service', async () => {
    const response = await request(app)
      .post('/askllm')
      .send({
        question: 'question',
        apiKey: 'apiKey',
        model: 'gemini'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  it('should respond with status 200 for /questions/:category endpoint', async () => {
    // Mock the external service (question service) to return some data
    axios.get.mockResolvedValueOnce({
      data: [
        { question: '¿A que país pertenece esta imagen?', answer: 'Paris' },
      ]
    });
  
    // Send a GET request to the /questions/:category endpoint with a mock category
    const response = await request(app).get('/questions/country');
  
    // Check that the response status is 200
    expect(response.status).toBe(200);
  
    // Check that the response body contains the expected data
    expect(response.body).toEqual([
      { question: '¿A que país pertenece esta imagen?', answer: 'Paris' },
    ]);
  });
  
  it('should handle /questions/:category errors and respond with appropriate status and message', async () => {
    // Mock the external service (question service) to return an error
    axios.get.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { error: 'Failed to fetch questions from the question service' }
      }
    });
  
    // Send a GET request to the /questions/:category endpoint with a mock category
    const response = await request(app).get('/questions/country');

    expect(response.status).toBe(500);
  
    // Check that the error message is returned properly
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  });
  
});
