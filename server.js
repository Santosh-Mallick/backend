const express = require('express');
const app = express();
const dbConnect = require('./config/db');

// Middleware
app.use(express.json());

// Load environment variables
require('dotenv').config();

// Database connection
dbConnect();

// Import routes
const mapRoute = require('./routes/mapRoute');
app.use('/api/map', mapRoute);

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});