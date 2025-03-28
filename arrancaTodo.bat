@echo off

start "GatewayService" cmd /k "cd gatewayservice && npm install && npm start"
start "LLMService" cmd /k "cd llmservice && npm install && npm start"
start "QuestionsService" cmd /k "cd questions && npm install && npm start"
start "AuthService" cmd /k "cd users\authservice && npm install && npm start"
start "UserService" cmd /k "cd users\userservice && npm install && npm start"
start "HistoryService" cmd /k "cd users\historyservice && npm install && npm start"
start "WebApp" cmd /k "cd webapp && npm install && npm start"

echo Todos los servicios se han iniciado en ventanas separadas