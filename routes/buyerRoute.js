const express = require('express');
const { 
    placeOrder, 
    cancelOrder, 
    getCreditWallet, 
    applyCreditPoints 
} = require('../controllers/buyerController');
const { findClosestSeller } = require('../controllers/suggestionController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all buyer routes
router.use(verifyToken);

// Order management routes
router.post('/place-order', placeOrder);
router.put('/cancel-order/:orderId', cancelOrder);

// Credit wallet routes
router.get('/credit-wallet/:buyerId', getCreditWallet);
router.post('/apply-credit-points/:buyerId', applyCreditPoints);

// Suggestion routes
router.post('/find-closest-sellers', findClosestSeller);

module.exports = router;