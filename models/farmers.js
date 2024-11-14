const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  farmer_name: {
    type: String,
    required: true
  },
  commodity_name: {
    type: String,
    required: true
  },
  outstanding_amount: {
    type: Number,
    required: true
  },
  commodity_number: {
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
  cash: {
    type: Number,
    required: true
  },
  commission: {
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
    ref: 'Customer',
  }
});

const Farmer = mongoose.model('Farmer', farmerSchema);


module.exports = Farmer;
