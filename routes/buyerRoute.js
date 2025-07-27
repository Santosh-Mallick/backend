const express = require('express');
const router = express.Router();

const { findClosestSeller } = require('../controllers/suggestionController');
const { getSellerProductsForBuyer } = require('../controllers/buyerController');
router.post('/find-closest-sellers', findClosestSeller);

router.get('/seller-prod/:sellerId', getSellerProductsForBuyer);

// Export the router 
module.exports = router;