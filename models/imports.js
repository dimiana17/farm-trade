const mongoose = require('mongoose');

const importsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  cash: {
    type: Number,  // Changed to Number
    required: true
  },
  statement: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Import = mongoose.model('Imports', importsSchema);

module.exports = Import;
