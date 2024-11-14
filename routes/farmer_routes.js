const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmer_controller'); // Ensure the path is correct

router.get('/search', farmerController.searchFarmers);
// Route to get all farmers and insert a new farmer

router.route('/')
    .get(farmerController.getAllFarmers)
    .post(farmerController.insertFarmer)
    .delete(farmerController.deleteAllFarmers);

router.get('/month', farmerController.getFarmersByMonth);

router.get('/distinct-dates', farmerController.getDistinctMonthsAndYears);

router.get('/commission-sum', farmerController.getCommissionSum);

// Route to get, update, or delete a single farmer by ID
router.route('/:farmerId')
    .get(farmerController.getSingleFarmer)
    .patch(farmerController.updateFarmer)
    .delete(farmerController.deleteFarmer);

// Route to get transactions by farmer name

// Route to get farmer data by farmer name
// router.route('/farmer/name/:name')
//     .get(farmerController.getFarmerDataByFarmerName);

// Route to update the sold value for a farmer by farmerId
router.put('/:farmerId/sold', farmerController.updateSoldStatus);

// Define the route to get farmers by date
// router.route('/date/:date')
//     .get(farmerController.getFarmersByDate);

// Route for getting the sum of farmer cash by farmer name
// router.get('/cashSum', farmerController.getFarmerCashSum);

module.exports = router;
