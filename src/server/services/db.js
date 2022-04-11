const config = require('../config.json');
const mongoose = require('mongoose');
const Player = require('../models/player');

mongoose.connect(config.connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;

conn.on('connected', () => {
  console.log('Mongoose connection open to', config.connectionString);
});

conn.on('error', error => {
  console.log(`Mongoose connection error: ${error}`);
});

conn.on('disconnected', () => {
  console.log('Mongoose connection disconnected');
});

module.exports = {
  Connection: mongoose.connection,
  Player,
};