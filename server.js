const express = require('express');
const cors = require('cors');
const app = express();
const dbConnect = require('./config/db');

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://4nszb003-5173.inc1.devtunnels.ms'], // Allow frontend URLs
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({
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

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      message: 'Invalid JSON format', 
      details: 'Please check your JSON syntax. Make sure all string values are in quotes.',
      example: {
        "phone": "1234567890",
        "password": "password123"
      }
    });
  }
  next();
});

// Load environment variables
require('dotenv').config();

// Database connection
dbConnect();

// Import routes
const mapRoute = require('./routes/mapRoute');
const authRoute = require('./routes/authRoute');
app.use('/api/map', mapRoute);
app.use('/api/auth', authRoute);

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