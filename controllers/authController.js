const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Buyer Registration
exports.registerBuyer = async (req, res) => {
  try {
    console.log('Backend - Buyer registration request body:', req.body);
    const { name, phone, email, password, address, location } = req.body;
    
    // Input validation
    if (!name || !phone || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['name', 'phone', 'password'] 
      });
    }

    if (typeof name !== 'string' || typeof phone !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        message: 'Invalid data types', 
        details: 'name, phone, and password must be strings' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    if (phone.length < 10) {
      return res.status(400).json({ 
        message: 'Phone number must be at least 10 digits' 
      });
    }

    if (location && (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2)) {
      return res.status(400).json({ 
        message: 'Location coordinates must be an array of [longitude, latitude]' 
      });
    }

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ phone });
    if (existingBuyer) {
      return res.status(400).json({ message: 'Buyer with this phone number already exists' });
    }

    // Check if email is provided and already exists
    if (email) {
      const existingEmail = await Buyer.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Buyer with this email already exists' });
      }
    }

    const buyer = new Buyer({ name, phone, email, password, address, location });
    await buyer.save();
    
    console.log('Backend - Buyer created successfully:', buyer._id);
    
    // Generate token
    const token = jwt.sign({ id: buyer._id, role: 'buyer' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      message: 'Buyer registered successfully',
      token,
      role: 'buyer',
      user: {
        id: buyer._id,
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email
      }
    });
  } catch (err) {
    console.error('Backend - Buyer registration error:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Phone number or email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Seller Registration
exports.registerSeller = async (req, res) => {
  try {
    console.log('Backend - Seller registration request body:', req.body);
    const { name, ownerName, email, phone, password, address, location, products, fssaiNumber } = req.body;
    
    // Input validation
    if (!name || !ownerName || !phone || !password || !fssaiNumber) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['name', 'ownerName', 'phone', 'password', 'fssaiNumber'] 
      });
    }

    if (typeof name !== 'string' || typeof ownerName !== 'string' || typeof phone !== 'string' || typeof password !== 'string' || typeof fssaiNumber !== 'string') {
      return res.status(400).json({ 
        message: 'Invalid data types', 
        details: 'name, ownerName, phone, password, and fssaiNumber must be strings' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    if (phone.length < 10) {
      return res.status(400).json({ 
        message: 'Phone number must be at least 10 digits' 
      });
    }

    if (fssaiNumber.trim() === '') {
      return res.status(400).json({ 
        message: 'FSSAI number cannot be empty' 
      });
    }

    if (location && (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2)) {
      return res.status(400).json({ 
        message: 'Location coordinates must be an array of [longitude, latitude]' 
      });
    }

    if (products && !Array.isArray(products)) {
      return res.status(400).json({ 
        message: 'Products must be an array of strings' 
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ phone });
    if (existingSeller) {
      return res.status(400).json({ message: 'Seller with this phone number already exists' });
    }

    // Check if email is provided and already exists
    if (email) {
      const existingEmail = await Seller.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Seller with this email already exists' });
      }
    }

    const seller = new Seller({ 
      name, 
      ownerName, 
      email, 
      phone, 
      password, 
      address, 
      location, 
      products,
      fssaiNumber // Now required, so always include it
    });
    await seller.save();
    
    console.log('Backend - Seller created successfully:', seller._id);
    
    // Generate token
    const token = jwt.sign({ id: seller._id, role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      message: 'Seller registered successfully',
      token,
      role: 'seller',
      user: {
        id: seller._id,
        name: seller.name,
        ownerName: seller.ownerName,
        phone: seller.phone,
        email: seller.email,
        products: seller.products
      }
    });
  } catch (err) {
    console.error('Backend - Seller registration error:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Phone number or email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Buyer Login
exports.loginBuyer = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Input validation
    if (!phone || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['phone', 'password'] 
      });
    }

    if (typeof phone !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        message: 'Invalid data types', 
        details: 'phone and password must be strings' 
      });
    }

    // Find buyer
    const buyer = await Buyer.findOne({ phone }).select('+password');
    if (!buyer) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        details: 'No buyer found with this phone number'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    // Generate token
    const token = jwt.sign({ id: buyer._id, role: 'buyer' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      message: 'Login successful',
      token, 
      role: 'buyer',
      user: {
        id: buyer._id,
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Seller Login
exports.loginSeller = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Input validation
    if (!phone || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['phone', 'password'] 
      });
    }

    if (typeof phone !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        message: 'Invalid data types', 
        details: 'phone and password must be strings' 
      });
    }

    // Find seller
    const seller = await Seller.findOne({ phone }).select('+password');
    if (!seller) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        details: 'No seller found with this phone number'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    // Generate token
    const token = jwt.sign({ id: seller._id, role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      message: 'Login successful',
      token, 
      role: 'seller',
      user: {
        id: seller._id,
        name: seller.name,
        ownerName: seller.ownerName,
        phone: seller.phone,
        email: seller.email,
        products: seller.products
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 