const mongoose = require('mongoose');

const onionGarlicCustomerSchema = new mongoose.Schema({
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
    ref: 'onion_garlic_farmers' // Array of references to sauce_farmers
  }]
});

const onionGarlicCustomer = mongoose.model('onion_garlic_customers', onionGarlicCustomerSchema);
module.exports = onionGarlicCustomer;
