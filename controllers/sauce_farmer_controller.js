const SauceFarmer = require('../models/sauce_farmers');
const mongoose = require('mongoose');

const getAllFarmers = async (req, res) => {
    try {
        const farmers = await SauceFarmer.find().populate('customer'); // Populate customer info
        res.json(farmers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get a single farmer by ID
const getSingleFarmer = async (req, res) => {
    try {
        const id = req.params.farmerId;
        const farmer = await SauceFarmer.findById(id).populate('customer');
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found" });
        }
        res.json(farmer);
    } catch (error) {
        return res.status(400).json({ message: "Invalid ID" });
    }
};

// Get all farmers by name
const getFarmersByName = async (req, res) => {
    try {
        const name = req.params.name;
        const farmers = await SauceFarmer.find({ farmer_name: name }).populate('customer');
        if (!farmers.length) {
            return res.status(404).json({ message: 'No farmers found with that name' });
        }
        res.json(farmers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Insert a new farmer
const insertFarmer = async (req, res) => {
    try {
        const { 
            farmer_name, 
            outstanding_amount, 
            price, 
            nolon, 
            advance, 
            commission,
            deserved_cash,
            date = new Date() // Set current date if not provided
        } = req.body;

        // Calculate values
        const net_amount = 0.95 * outstanding_amount;
        const cash = net_amount * price;
        // const deserved_cash = cash - (commission + nolon + advance +15);

        const farmer = new SauceFarmer({
            date,             // Ensure date is included
            farmer_name,
            outstanding_amount,
            price,
            commission,
            nolon,
            advance,
            net_amount,      // Calculated value
            cash,            // Calculated value
            deserved_cash,   // Calculated value
            sold: req.body.sold || "no" // Default to "no" if not provided
        });

        await farmer.save();
        res.status(201).json(farmer);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Update farmer function
const updateFarmer = async (req, res) => {
    try {
        const { farmerId } = req.params; // Get farmer ID from the request parameters
        const { 
            farmer_name, // Include farmer_name in the request body
            outstanding_amount, 
            price, 
            commission, 
            nolon, 
            advance,
            net_amount,      // Include net_amount in the request body
            cash,            // Include cash in the request body
            deserved_cash    // Include deserved_cash in the request body
        } = req.body;

        // Validate that the required fields are present
        if (typeof farmer_name !== 'string' || 
            isNaN(outstanding_amount) || 
            isNaN(price) || 
            isNaN(commission) || 
            isNaN(nolon) || 
            isNaN(advance) ||
            isNaN(net_amount) ||
            isNaN(cash) ||
            isNaN(deserved_cash)) {
            return res.status(400).json({ error: "All fields must be valid." });
        };

        // Find the farmer and update their information
        const farmer = await SauceFarmer.findByIdAndUpdate(
            farmerId,
            {
                farmer_name, // Update farmer_name
                outstanding_amount,
                price,
                commission,
                nolon,
                advance,
                net_amount,      // Directly update net_amount
                cash,            // Directly update cash
                deserved_cash    // Directly update deserved_cash
            },
            { new: true, runValidators: true } // Ensure validators are run on update
        );

        // Check if the farmer was found and updated
        if (!farmer) {
            return res.status(404).json({ error: 'Farmer not found' });
        };

        res.status(200).json(farmer);
    } catch (error) {
        console.error("Error updating farmer:", error); // Log error for debugging
        res.status(500).json({ error: error.message });
    }
};

// Delete a farmer
const deleteFarmer = async (req, res) => {
    try {
        const id = req.params.farmerId;
        const farmer = await SauceFarmer.findByIdAndDelete(id);
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found" });
        }
        res.json(farmer);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
const updateSoldStatus = async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        
        // Validate farmer ID
        if (!mongoose.Types.ObjectId.isValid(farmerId)) {
            return res.status(400).json({ message: "Invalid farmer ID" });
        }

        // Ensure `sold` field is provided in the request body
        const { sold } = req.body;
        if (!sold || (sold !== 'yes' && sold !== 'no')) {
            return res.status(400).json({ message: "Invalid 'sold' value. It must be 'yes' or 'no'." });
        }

        // Find the farmer and update the sold status
        const farmer = await SauceFarmer.findByIdAndUpdate(
            farmerId, 
            { sold: sold }, 
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
const searchSauceFarmers = async (req, res) => {
    try {
        const name = req.query.name;
        const date = req.query.date;

        const filter = {};
        if (name) {
            const trimmedName = name.trim();
            const regexName = trimmedName.replace(/\s+/g, '\\s*'); // Handle multiple spaces in the name
            filter.farmer_name = { $regex: new RegExp(regexName, 'i') }; // Case-insensitive search
        }

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


        const sauceFarmers = await SauceFarmer.find(filter).populate('customer'); // Ensure correct population

        // Always return 200 OK, with either the data or an empty array
        res.status(200).json(sauceFarmers);
    } catch (error) {
        console.error("Error searching sauce farmers:", error);
        res.status(500).json({ message: error.message });
    }
};
  // Delete all sauce farmers
const deleteAllSauceFarmers = async (req, res) => {
    try {
      const result = await SauceFarmer.deleteMany({}); // Delete all documents in the Customer collection
  
      // Respond with the number of deleted documents
      res.json({ message: `${result.deletedCount} sauce farmers deleted.` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
// Get farmers' data for a specific month
const getSauceFarmersByMonth = async (req, res) => {
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
      const farmers = await SauceFarmer.find({
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
      const distinctDates = await SauceFarmer.aggregate([
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
  
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
  
      // Perform aggregation to calculate the sum of commissions within the specified period
      const result = await SauceFarmer.aggregate([
        {
          $match: {
            date: { $gte: start, $lte: end } // Match farmers within the date range
          }
        },
        {
          $group: {
            _id: null, // Group all matched records together
            totalCommission: { $sum: "$commission" } // Sum the "commission" field
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
    getSauceFarmersByMonth,
    getDistinctMonthsAndYears,
    deleteAllSauceFarmers,
    searchSauceFarmers,
    updateSoldStatus,
    getAllFarmers,
    getSingleFarmer,
    getFarmersByName,
    insertFarmer,
    updateFarmer,
    deleteFarmer
};
