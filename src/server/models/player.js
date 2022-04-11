const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  userName: { type: String, unique: true, required: true },
  color: { type: String },
  position: { type: Object },
  currency: { type: Number },
  createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Player', schema);