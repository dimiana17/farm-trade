const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer_controller'); // Ensure the path is correct
router.get('/search', customerController.searchCustomers);

router.get('/month', customerController.getCustomersByMonth);
router.get('/sums', customerController.getCustomerSums);
router.get('/sums/name/:name', customerController.getCustomerSumsByName);

router.get('/distinct-dates', customerController.getDistinctMonthsAndYears);
// Route to get all customers and insert a new customer
router.route('/')
    .get(customerController.getAllCustomers)
    .post(customerController.insertCustomer);
// Route to get, update, or delete a single customer by ID
router.route('/:customerId')
    .get(customerController.getSingleCustomer)
    .patch(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

// New route for getting customer data by name or date
router.get('/byFarmer/:farmerId', customerController.getCustomerByFarmerId);

// Route for getting the sum of customer cash by customer name
// router.get('/customer/cashSum', customerController.getCustomerCashSum);

module.exports = router;
