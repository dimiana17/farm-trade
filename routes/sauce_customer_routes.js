const express = require('express');
const router = express.Router();
const customerController = require('../controllers/sauce_customer_controller'); // Adjust the path as needed
router.get('/search', customerController.searchSauceCustomers);

router.get('/month', customerController.getSauceCustomersByMonth);
router.get('/sums', customerController.getCustomerSums);
router.get('/sums/name/:name', customerController.getCustomerSumsByName);

router.get('/distinct-dates', customerController.getDistinctMonthsAndYears);

// Route to get all customers and insert a new customer
router.route('/')
    .get(customerController.getAllCustomers)
    .post(customerController.insertCustomer)
    .delete(customerController.deleteAllSauceCustomers);

// Route to get, update, or delete a single customer by ID
router.route('/:customerId')
    .get(customerController.getSingleCustomer)
    .patch(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

// Route for getting customer data by customer name
router.route('/customer/name/:name')
    .get(customerController.getCustomersByName);
//route for get sauce customer by date    
router.route('/date/:date')
    .get(customerController.getSauceCustByDate);

module.exports = router;
