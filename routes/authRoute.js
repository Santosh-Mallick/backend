const express = require('express');
const { registerBuyer, registerSeller, loginBuyer, loginSeller } = require('../controllers/authController');
const router = express.Router();

// Buyer routes
router.post('/buyer/register', registerBuyer);
router.post('/buyer/login', loginBuyer);

// Seller routes
router.post('/seller/register', registerSeller);
router.post('/seller/login', loginSeller);

module.exports = router; 