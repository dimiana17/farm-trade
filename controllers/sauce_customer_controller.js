const SauceCustomer = require('../models/sauce_customers');
const SauceFarmer = require('../models/sauce_farmers');
const mongoose = require('mongoose');

// Get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await SauceCustomer.find().populate('farmers');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single customer by ID
const getSingleCustomer = async (req, res) => {
    try {
        const id = req.params.customerId;
        const customer = await SauceCustomer.findById(id).populate('farmers');
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        return res.status(400).json({ message: "Invalid ID" });
    }
};

// Get all customers by name
const getCustomersByName = async (req, res) => {
    try {
        const name = req.params.name;
        const customers = await SauceCustomer.find({ customer_name: name }).populate('farmers');
        if (!customers.length) {
            return res.status(404).json({ message: 'No customers found with that name' });
        };
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    };
};

// Insert a new customer

const insertCustomer = async (req, res) => {
    try {
        const { farmers, ras, Financial_commitment } = req.body;

        // Fetch all related farmers based on their IDs from the sauce_farmers collection
        const relatedFarmers = await SauceFarmer.find({ '_id': { $in: farmers } });

        // Sum the cash (or relevant field) from the related farmers
        const farmersCashSum = relatedFarmers.reduce((sum, farmer) => sum + farmer.cash, 0); // Assuming `cash` is the field to sum

        // Calculate customer_cash
        const customer_cash = farmersCashSum + ras + Financial_commitment;

        // Create the new customer document, including the computed customer_cash
        const customer = new SauceCustomer({
            ...req.body,
            customer_cash,  // Include the calculated value
        });

        // Save the customer document
        await customer.save();

        // Return the created customer as a response
        res.status(201).json(customer);

    } catch (error) {
        // Return error response in case of any issues
        return res.status(400).json({ error: error.message });
    }
};

// Update a customer
const updateCustomer = async (req, res) => {
    try {
        const id = req.params.customerId;
        const customer = await SauceCustomer.findByIdAndUpdate(id, req.body, { new: true }).populate('farmers');
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
    try {
        const id = req.params.customerId;
        const customer = await SauceCustomer.findByIdAndDelete(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
//get sauce cust by date
const getSauceCustByDate = async (req, res) => {
    try {
      const date = req.params.date;
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
  
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
  
      const SauceCustomers = await SauceCustomer.find({
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
  
      if (SauceCustomers.length === 0) {
        return res.status(404).json({ message: 'No sauce customers found for this date' });
      };
  
      res.json(SauceCustomers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const searchSauceCustomers = async (req, res) => {
    try {
        const name = req.query.name;
        const date = req.query.date;

        const filter = {};
        if (name) {
            const trimmedName = name.trim();
            const regexName = trimmedName.replace(/\s+/g, '\\s*'); // Handle any whitespaces in the name
            filter.customer_name = { $regex: new RegExp(regexName, 'i') }; // Case-insensitive search
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

        const sauceCustomers = await SauceCustomer.find(filter).populate('farmers'); // Ensure 'farmers' is correctly populated

        // Return 200 OK even if no customers are found
        res.status(200).json(sauceCustomers);
        
    } catch (error) {
        console.error("Error searching sauce customers:", error); // Log error for debugging
        res.status(500).json({ message: error.message });
    }
};
  
// Delete all sauce customers
const deleteAllSauceCustomers = async (req, res) => {
    try {
      const result = await SauceCustomer.deleteMany({}); // Delete all documents in the Customer collection
  
      // Respond with the number of deleted documents
      res.json({ message: `${result.deletedCount} sauce customers deleted.` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

const getSauceCustomersByMonth = async (req, res) => {
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
    const customers = await SauceCustomer.find({
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
    const distinctDates = await SauceCustomer.aggregate([
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
    };

    res.json(distinctDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

      const result = await SauceCustomer.aggregate(pipeline);

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
    const result = await SauceCustomer.aggregate(pipeline);

    // If no result, return a message
    if (!result.length) {
      return res.status(404).json({ message: `No customer found with the name ${name}` });
    };

    // Return the result
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};


module.exports = {
  getCustomerSumsByName,
  getCustomerSums,
  getSauceCustomersByMonth,
  getDistinctMonthsAndYears,
    deleteAllSauceCustomers,
    searchSauceCustomers,
    getSauceCustByDate,
    getAllCustomers,
    getSingleCustomer,
    getCustomersByName,
    insertCustomer,
    updateCustomer,
    deleteCustomer
};
