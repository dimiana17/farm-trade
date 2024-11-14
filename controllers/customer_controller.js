const mongoose = require('mongoose');
const Farmer = require('../models/farmers'); // Import Farmer model
const Customer = require('../models/customers');

// Get all customers with the farmer's name
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate({
        path: 'farmers', // Populate the array of farmer IDs
        select: 'farmer_name commodity_name outstanding_amount commodity_number net_amount price cash deserved_cash' // Only select the fields you need
      });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get a single customer by ID
const getSingleCustomer = async (req, res) => {
  try {
    const id = req.params.customerId;
    // Use populate to include farmer details
    const customer = await Customer.findById(id).populate('farmers', 'farmer_name commodity_name outstanding_amount commodity_number net_amount price cash deserved_cash');

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    // Check if the error is related to an invalid ID format
    return res.status(400).json({ message: "Invalid ID" });
  }
};


// Insert a new customer
const insertCustomer = async (req, res) => {
  try {
    const { farmerId, outgoing } = req.body;

    // Check if farmerId is an array and not empty
    if (!Array.isArray(farmerId) || farmerId.length === 0) {
      return res.status(400).json({ message: "Invalid farmer ID(s) array/length" });
    }

    // Validate each farmer ID and convert to ObjectId
    const validFarmerIds = farmerId.map(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid farmer ID: ${id}`);
      }
      return new mongoose.Types.new(id); // Use 'new' keyword
    });

    // Find all farmers by the given IDs
    const farmers = await Farmer.find({ _id: { $in: validFarmerIds } });
    if (farmers.length !== validFarmerIds.length) {
      return res.status(404).json({ message: "One or more farmers not found" });
    }

    // Convert outgoing to a number
    const outgoingAmount = Number(outgoing);

    // Accumulate farmer's cash to calculate customer_cash
    const totalFarmerCash = farmers.reduce((acc, farmer) => {
      return acc + (Number(farmer.cash) || 0);
    }, 0);
    const customer_cash = totalFarmerCash + outgoingAmount;

    // Create a new customer with the array of farmer IDs
    let customer = new Customer({
      ...req.body,
      customer_cash, // Calculated customer cash
      farmers: validFarmerIds // Set the array of farmer IDs
    });

    // Save the customer to the database
    await customer.save();

    // Respond with the saved customer
    res.status(201).json(customer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};



// Update a customer
const updateCustomer = async (req, res) => {
  try {
    const { outgoing, customer_name, customer_cash, Amount_paid } = req.body; // Include customer_cash in the request body
    const id = req.params.customerId;

    // Find the customer by ID and populate the farmers field
    let customer = await Customer.findById(id).populate('farmers');

    // If customer not found, return an error
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update the customer with the new data
    customer.customer_name = customer_name;
    customer.outgoing = parseFloat(outgoing) || 0; // Ensure it's a number
    customer.customer_cash = parseFloat(customer_cash) || 0; // Update customer_cash

    // Check if Amount_paid has changed
    if (parseFloat(Amount_paid) !== customer.Amount_paid) {
      customer.Amount_paid = parseFloat(Amount_paid) || 0;
      customer.Payment_date = new Date(); // Update Payment_date to current date
    }

    // Save the updated customer
    await customer.save();

    // Respond with the updated customer, including populated farmers
    res.json(customer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};



// Delete a customer
const deleteCustomer = async (req, res) => {
  try {
    const id = req.params.customerId;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Respond with the deleted customer
    res.json(customer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get customer data by customer name
// Get farmers by date
const searchCustomers = async (req, res) => {
  try {
      const name = req.query.customer_name;  // Updated to match 'customer_name'
      const date = req.query.date;
      const commodityName = req.query.commodity_name;

      const matchStage = {};

      if (name) {
          const trimmedName = name.trim().replace(/^'|'$/g, '');  // Remove single quotes
          const regexName = trimmedName.replace(/\s+/g, '\\s*');
          matchStage.customer_name = { $regex: new RegExp(regexName, 'i') }; // Case-insensitive search
      }

      if (date) {
          const parsedDate = new Date(date);
          if (isNaN(parsedDate.getTime())) {
              return res.status(400).json({ message: 'Invalid date format' });
          }
          const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
          matchStage.date = { $gte: startOfDay, $lt: endOfDay };
      }

      const pipeline = [
          {
              $match: matchStage
          },
          {
              $lookup: {
                  from: 'farmers',
                  localField: 'farmers',
                  foreignField: '_id',
                  as: 'farmers'
              }
          },
          {
              $unwind: '$farmers'
          },
          {
              $match: {
                  'farmers.commodity_name': { $regex: new RegExp(commodityName, 'i') }
              }
          },
          {
              $group: {
                  _id: '$_id',
                  customer_name: { $first: '$customer_name' },
                  outgoing: { $first: '$outgoing' },
                  customer_cash: { $first: '$customer_cash' },
                  Amount_paid: { $first: '$Amount_paid' },
                  date: { $first: '$date' },
                  farmers: { $push: '$farmers' }
              }
          }
      ];

      const customers = await Customer.aggregate(pipeline);

      res.status(200).json(customers);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


// Delete all customers
// const deleteAllCustomers = async (req, res) => {
//   try {
//     const result = await Customer.deleteMany({}); // Delete all documents in the Customer collection

//     // Respond with the number of deleted documents
//     res.json({ message: ${result.deletedCount} customers deleted. });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Get farmers' data for a specific month
// Get customers' data for a specific month
const getCustomersByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Validate the year and month input
    if (!year || !month || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid year or month format' });
    }

    // Calculate the start and end dates of the given month
    const startDate = new Date(year, month - 1, 1); // First day of the month
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month at 23:59:59

    // Find customers whose data falls within the given month
    const customers = await Customer.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('farmers'); // Populate the farmers field

    // Check if any data is found
    if (!customers.length) {
      return res.status(404).json({ message: 'No customers found for this month.' });
    }

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDistinctMonthsAndYears = async (req, res) => {
  try {
    const distinctDates = await Customer.aggregate([
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
// Controller function to get customer by farmer ID
const getCustomerByFarmerId = async (req, res) => {
  try {
      const farmerId = req.params.farmerId; // Get the farmer ID from request parameters

      // Ensure farmerId is an ObjectId
      if (!mongoose.Types.ObjectId.isValid(farmerId)) {
          return res.status(400).json({ message: 'Invalid farmer ID format' });
      }

      // Find the customer associated with the given farmerId
      const customer = await Customer.findOne({ farmers: farmerId }); // Check against the ObjectId directly
      
      if (!customer) {
          return res.status(404).json({ message: 'Customer not found for this farmer' });
      }

      // Respond with the found customer
      res.json(customer);
  } catch (error) {
      return res.status(400).json({ error: error.message });
  }
};

const getCustomerSums = async (req, res) => {
  try {
      // Use MongoDB aggregation to calculate the sums
      const pipeline = [
          {
              $group: {
                  _id: '$customer_name', // Group by customer name
                  total_customer_cash: { $sum: '$customer_cash' }, // Sum of customer_cash for each customer
                  total_amount_paid: { $sum: '$Amount_paid' }, // Sum of Amount_paid for each customer
              }
          },
          {
              $project: {
                  customer_name: '$_id', // Include customer_name
                  total_customer_cash: 1, // Include the sum of customer_cash
                  total_amount_paid: 1, // Include the sum of Amount_paid
                  total_balance: { $subtract: ['$total_customer_cash', '$total_amount_paid'] } // Calculate the balance
              }
          }
      ];

      const result = await Customer.aggregate(pipeline);

      // Return the result
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
const getCustomerSumsByName = async (req, res) => {
  try {
    const { name } = req.params; // Get the name from the request params

    // Aggregate query to get sum of customer_cash, Amount_paid, and balance by customer_name
    const pipeline = [
      {
        $match: { customer_name: { $regex: new RegExp(name, 'i') } } // Match customers by name (case-insensitive)
      },
      {
        $group: {
          _id: '$customer_name', // Group by customer name
          total_customer_cash: { $sum: '$customer_cash' }, // Sum of customer_cash for each customer
          total_amount_paid: { $sum: '$Amount_paid' }, // Sum of Amount_paid for each customer
          total_balance: { $sum: { $subtract: ['$customer_cash', '$Amount_paid'] } }, // Calculate total balance (customer_cash - Amount_paid)
        }
      },
      {
        $project: {
          _id: 0, // Exclude _id
          customer_name: '$_id', // Add customer_name field from _id
          total_customer_cash: 1,
          total_amount_paid: 1,
          total_balance: 1
        }
      }
    ];

    // Execute aggregation
    const result = await Customer.aggregate(pipeline);

    // If no result, return a message
    if (!result.length) {
      return res.status(404).json({ message: `No customer found with the name ${name}` });
    }

    // Return the result
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};


module.exports = {
  getCustomerSumsByName,
  getCustomerSums,
  getCustomerByFarmerId,
  getCustomersByMonth,
  getDistinctMonthsAndYears,
  //deleteAllCustomers,
  searchCustomers,
  getAllCustomers,
  getSingleCustomer,
  insertCustomer,
  updateCustomer,
  deleteCustomer,
};