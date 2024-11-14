const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  customer_name: {
    type: String,
    required: true
  },
  outgoing: {
    type: Number,
    required: true
  },
  
  customer_cash: {
    type: Number, // Optional field, which is fine
  },
  Amount_paid: {
    type: Number,
    default: 0,
  },
  Payment_date: {
    type: String,
    default: '--/--/----',
  },
  farmers: [{ // Now an array of ObjectIds to reference multiple farmers
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
  }]
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
