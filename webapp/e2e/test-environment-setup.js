const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoserver;
let userservice;
let authservice;
let llmservice;
let gatewayservice;

async function startServer() {
    console.log('Starting MongoDB memory server...');
    mongoserver = await MongoMemoryServer.create();
    const mongoUri = mongoserver.getUri();
    process.env.MONGODB_URI = mongoUri;
    userservice = await require("../../users/userservice/user-service");
    authservice = await require("../../users/authservice/auth-service");
    llmservice = await require("../../llmservice/llm-service");
    questionservice = await require("../../questionservice/services/question-service");
    historyservice = await require("../../users/historyservice/history-service");
    gatewayservice = await require("../../gatewayservice/gateway-service");

}

startServer();
