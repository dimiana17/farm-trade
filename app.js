const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const customerRouter = require('./routes/customer_routes');
const farmerRouter = require('./routes/farmer_routes');
const sauceCustomerRouter = require('./routes/sauce_customer_routes');
const sauceFarmerRouter = require('./routes/sauce_farmer_routes');
const onionGarlicFarmerRouter = require('./routes/onion_garlic_farmer_routes');
const onionGarlicCustomerRouter = require('./routes/onion_garlic_customer_routes');
const financeRouter = require('./routes/finance_routes');

dotenv.config();

const app = express();

// Serve static files from 'views' folder
app.use(express.static(path.join(__dirname, 'views')));

// Example route for rendering the main.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

// Apply CORS middleware
app.use(cors());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route handling
app.use('/api/customers', customerRouter);
app.use('/api/farmers', farmerRouter);
app.use('/api/saucefarmers', sauceFarmerRouter);
app.use('/api/saucecustomers', sauceCustomerRouter);
app.use('/api/oniongarlicfarmers', onionGarlicFarmerRouter);
app.use('/api/oniongarliccustomers', onionGarlicCustomerRouter);
app.use('/api/finances', financeRouter);


module.exports = app;
