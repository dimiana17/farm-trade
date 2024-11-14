const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/sauce_farmer_controller'); // Adjust the path as needed

router.get('/search', farmerController.searchSauceFarmers);

router.get('/month', farmerController.getSauceFarmersByMonth);

router.get('/distinct-dates', farmerController.getDistinctMonthsAndYears);

// Route to get all farmers and insert a new farmer
router.route('/')
    .get(farmerController.getAllFarmers)
    .post(farmerController.insertFarmer)
    .delete(farmerController.deleteAllSauceFarmers);


router.get('/commission-sum', farmerController.getCommissionSum);

// Route to get, update, or delete a single farmer by ID
router.route('/:farmerId')
    .get(farmerController.getSingleFarmer)
    .patch(farmerController.updateFarmer)
    .delete(farmerController.deleteFarmer);

// Route for getting farmer data by farmer name
router.route('/farmer/name/:name')
    .get(farmerController.getFarmersByName);


router.put('/:farmerId/sold', farmerController.updateSoldStatus);

module.exports = router;
