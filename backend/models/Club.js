const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['technical', 'cultural', 'sports', 'administrative'], required: true },
  description: { type: String }
});

module.exports = mongoose.model('Club', clubSchema);