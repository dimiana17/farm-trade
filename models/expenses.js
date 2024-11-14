const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
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

const Expense = mongoose.model('Expenses', expensesSchema);

module.exports = Expense;
