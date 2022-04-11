const express = require("express");
const db = require('./services/db');
const metrics = require('./services/metrics');
const startGame = require("./services/game");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// expose our metrics at the default URL for Prometheus
app.get('/metrics', (request, response) => {
  const register = metrics.getRegister();
  response.set('Content-Type', register.contentType);
  response.send(register.metrics());
});

startGame(io, db, metrics);

console.log("Server started.");
server.listen(8080);