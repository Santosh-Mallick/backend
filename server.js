const express = require('express');
const cors = require('cors');
const app = express();
const dbConnect = require('./config/db');

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend URLs
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Load environment variables
require('dotenv').config();

// Database connection
dbConnect();

// Import routes
const mapRoute = require('./routes/mapRoute');
const authRoute = require('./routes/authRoute');
const sellerRoute = require('./routes/sellerRoute');
const buyerRoute = require('./routes/buyerRoute');

// Apply JSON parsing middleware to routes that need it
app.use('/api/auth', express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        message: 'Invalid JSON format', 
        details: 'Please check your JSON syntax. Make sure all string values are in quotes.',
        example: {
          "phone": "1234567890",
          "password": "password123"
        }
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use('/api/buyer', express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        message: 'Invalid JSON format', 
        details: 'Please check your JSON syntax. Make sure all string values are in quotes.',
        example: {
          "phone": "1234567890",
          "password": "password123"
        }
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use('/api/map', mapRoute);
app.use('/api/auth', authRoute);
app.use('/api/seller', sellerRoute);
app.use('/api/buyer', buyerRoute);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});