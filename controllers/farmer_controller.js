const Farmer = require('../models/farmers');
const Customer = require('../models/customers'); // Import Customer model
const mongoose = require('mongoose');

// Get all farmers
const getAllFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().populate('customer'); // Populate customer
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single farmer by ID
const getSingleFarmer = async (req, res) => {
  try {
    const id = req.params.farmerId;
    const farmer = await Farmer.findById(id).populate('customer'); // Populate customer
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    res.json(farmer);
  } catch (error) {
    return res.status(400).json({ message: "Invalid ID" });
  }
};

// Get all farmer data by farmer name
const getFarmerDataByFarmerName = async (req, res) => {
  try {
    const name = req.params.name;
    const farmers = await Farmer.find({ farmer_name: name }).populate('customer'); // Populate customer
    if (!farmers.length) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all transactions by farmer name
const getTransactionsByFarmerName = async (req, res) => {
  try {
    const name = req.params.name;
    const farmerIds = await Farmer.find({ farmer_name: name }).distinct('_id');

    const transactions = await Transaction.find({ farmer: { $in: farmerIds } })
      .populate('farmer')
      .populate('customer');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Insert a new farmer
// Insert a new farmer
const insertFarmer = async (req, res) => {
  try {
    const { outstanding_amount, commodity_number, price, commission, deserved_cash } = req.body;

    // Perform calculations on the server side
    const net_amount = outstanding_amount - 0.5 * commodity_number;
    const cash = net_amount * price;
    // const deserved_cash = cash - (15 + commission);

    // Create the farmer object with calculated values
    const farmer = new Farmer({
      ...req.body,
      net_amount, // Calculated net amount
      cash,      // Calculated cash
      sold: 'no' // Initialize as 'no'
    });

    // Save the farmer to the database
    await farmer.save();

    // Respond with the saved farmer
    res.status(201).json(farmer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


// Update a farmer without calculations
const updateFarmer = async (req, res) => {
  try {
    const id = req.params.farmerId;

    // Extract the fields to update from the request body
    const {
      farmer_name,
      commodity_name,
      outstanding_amount,
      commodity_number,
      net_amount,
      price,
      cash,
      commission,
      deserved_cash,
      sold,
      customer
    } = req.body;

    // Update the farmer with the new data without recalculating anything
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      id,
      {
        farmer_name,
        commodity_name,
        outstanding_amount,
        commodity_number,
        net_amount,  // Allow the user to provide the calculated values manually
        price,
        cash,
        commission,
        deserved_cash,
        sold,
        customer
      },
      { new: true } // Return the updated farmer document
    ).populate('customer'); // Populate the customer data if needed

    // If farmer not found
    if (!updatedFarmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.json(updatedFarmer); // Return the updated farmer object
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


// Delete a farmer
const deleteFarmer = async (req, res) => {
  try {
    const id = req.params.farmerId;
    const farmer = await Farmer.findByIdAndDelete(id);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Respond with the deleted farmer
    res.json(farmer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


// Get total cash for a specific farmer
const getFarmerCashSum = async (req, res) => {
  try {
    const { name } = req.query;
    const farmer = await Farmer.findOne({ farmer_name: name });

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const result = await Transaction.aggregate([
      { $match: { farmer: farmer._id } },
      { $group: { _id: null, totalCash: { $sum: "$purchase_price" } } }
    ]);

    const totalCash = result.length > 0 ? result[0].totalCash : 0;
    res.json({ farmer_name: name, total_cash: totalCash });
  } catch (error) {
    console.error("Error getting farmer cash sum:", error.message);
    res.status(500).json({ message: "An error occurred." });
  }
};

// Update sold value
// Update farmer's sold status
const updateSoldStatus = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;
    
    // Validate farmer ID
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: "Invalid farmer ID" });
    }

    // Find the farmer and update the sold status
    const farmer = await Farmer.findByIdAndUpdate(
      farmerId, 
      { sold: req.body.sold }, 
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.status(200).json({ success: true, farmer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const searchFarmers = async (req, res) => {
  try {
    const name = req.query.name;
    const date = req.query.date;
    const commodityName = req.query.commodityName;

    const filter = {};
    
    // Filter by farmer_name
    if (name) {
      const trimmedName = name.trim();
      const regexName = trimmedName.replace(/\s+/g, '\\s*');
      filter.farmer_name = { $regex: new RegExp(regexName, 'i') }; // Case-insensitive search
    }
    
    // Filter by date
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
      filter.date = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    };

    // Filter by commodity_name
    if (commodityName) {
      const trimmedCommodity = commodityName.trim();
      const regexCommodity = trimmedCommodity.replace(/\s+/g, '\\s*');
      filter.commodity_name = { $regex: new RegExp(regexCommodity, 'i') }; // Case-insensitive search
    }

    const farmers = await Farmer.find(filter);
    
    // Return an empty array if no farmers found, but with a 200 OK status
    res.status(200).json(farmers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete all customers
const deleteAllFarmers = async (req, res) => {
  try {
    const result = await Farmer.deleteMany({}); // Delete all documents in the Customer collection

    // Respond with the number of deleted documents
    res.json({ message: `${result.deletedCount} farmers deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get farmers' data for a specific month
const getFarmersByMonth = async (req, res) => {
  try {
    const { year, month } = req.query; // Expecting year and month as query parameters

    // Validate the year and month input
    if (!year || !month || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid year or month format' });
    }

    // Calculate the start and end dates of the given month
    const startDate = new Date(year, month - 1, 1); // month - 1 because months in JS Date are 0-indexed
    const endDate = new Date(year, month, 0); // 0 here gives the last day of the previous month

    // Find farmers whose data falls within the given month
    const farmers = await Farmer.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('customer'); // Populate customer if necessary

    // Return an empty array if no farmers found for the given month
    if (!farmers.length) {
      return res.status(404).json({ message: 'No farmers found for this month.' });
    }

    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDistinctMonthsAndYears = async (req, res) => {
  try {
    const distinctDates = await Farmer.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" }, // Extract year
            month: { $month: "$date" } // Extract month
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          year: "$_id.year",
          month: "$_id.month"
        }
      }
    ]);

    // If no records found
    if (!distinctDates.length) {
      return res.status(404).json({ message: 'No dates found.' });
    }

    res.json(distinctDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get the sum of commissions within a specified period
const getCommissionSum = async (req, res) => {
  try {
    // Extract the date range from query parameters
    const { startDate, endDate } = req.query;

    // Validate and parse dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Ensure endDate is exclusive; adjust to the end of the day if needed
    end.setHours(23, 59, 59, 999); // Set end to the last millisecond of the day

    // Perform aggregation to calculate the sum of commissions within the specified period
    const result = await Farmer.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          commission: { $ne: null } // Ensures no null commissions are counted
        }
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$commission" }
        }
      }
    ]);

    // If there is no data for the specified period
    const totalCommission = result.length > 0 ? result[0].totalCommission : 0;

    res.json({ startDate, endDate, totalCommission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getCommissionSum,
  getDistinctMonthsAndYears,
  getFarmersByMonth,
  deleteAllFarmers,
  searchFarmers,
  updateSoldStatus,
  getFarmerDataByFarmerName,
  getAllFarmers,
  getSingleFarmer,
  getTransactionsByFarmerName,
  insertFarmer,
  updateFarmer,
  deleteFarmer,
  getFarmerCashSum
};
