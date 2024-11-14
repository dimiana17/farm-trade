const express = require('express');
const router = express.Router();
const customerController = require('../controllers/onion_garlic_customer_controlleer'); // Ensure the path is correct
router.get('/search', customerController.searchOnionGarlicCustomers);
router.get('/month', customerController.getoGCustomersByMonth);
router.get('/sums', customerController.getCustomerSums);
router.get('/sums/name/:name', customerController.getCustomerSumsByName);

router.get('/distinct-dates', customerController.getDistinctMonthsAndYears);
// Route to get all customers and insert a new customer
router.route('/')
    .get(customerController.getAllCustomers)
    .post(customerController.insertCustomer)
    .delete(customerController.deleteAllCustomers);

// Route to get, update, or delete a single customer by ID
router.route('/:customerId')
    .get(customerController.getSingleCustomer)
    .patch(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

module.exports = router;
