const mongoose = require('mongoose');

const sauceFarmerSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  farmer_name: {
    type: String,
    required: true
  },
  outstanding_amount: {
    type: Number,
    required: true
  },
  net_amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    required: true
  },
  nolon: {
    type: Number,
    required: true
  },
  advance: {
    type: Number,
    required: true
  },
  cash: {
    type: Number,
    required: true
  },
  deserved_cash: {
    type: Number,
    required: true
  },
  sold: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sauce_customers' // Reference to sauce_customers collection
  }
});

const SauceFarmer = mongoose.model('sauce_farmers', sauceFarmerSchema);
module.exports = SauceFarmer;
