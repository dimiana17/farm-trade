const mongoose = require('mongoose');

const sauceCustomerSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  customer_name: {
    type: String,
    required: true
  },
  Financial_commitment: {
    type: Number,
    required: true
  },
  ras: {
    type: Number,
    required: true
  },
  customer_cash: {
    type: Number,
    required: true
  },
  Amount_paid: {
    type: Number,
    default: 0,
  },
  Payment_date: {
    type: String,
    default: '--/--/----',
  },
  farmers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sauce_farmers' // Array of references to sauce_farmers
  }]
});

const SauceCustomer = mongoose.model('sauce_customers', sauceCustomerSchema);
module.exports = SauceCustomer;
