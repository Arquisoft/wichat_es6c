//set a fake api key
process.env.LLM_API_KEY = 'test-api-key';

const request = require('supertest');
const axios = require('axios');
const app = require('./llm-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');

describe('LLM Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.startsWith('https://generativelanguage')) {
      return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: 'llmanswer' }] } }] } });
    } else if (url.startsWith('https://empathyai')) {
      return Promise.resolve({ data: { choices: [ {message: { content: 'llmanswer' } } ] } });
    }
  });

  // Test /ask endpoint
  it('the llm should reply', async () => {
    const response2 = await request(app)
      .post('/ask')
      .send({ question: 'a question', model: 'empathy',apiKey: process.env.LLM_API_KEY });

    expect(response2.statusCode).toBe(200);
    expect(response2.body.answer).toBe('llmanswer');
  });

  it('should return error for missing question', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ model: 'empathy', apiKey: process.env.LLM_API_KEY });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing required field: question');
  });

  it('should return error for missing model', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ question: 'a question', apiKey: process.env.LLM_API_KEY });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing required field: model');
  });



  it('the llm should not reply with unsupported model', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ question: 'a question', model: 'unsupported_model', apiKey: process.env.LLM_API_KEY });

    expect(response.body.answer).toBe(null);
  });



  

});