const express = require('express');
const router = express.Router();

const { findClosestSeller } = require('../controllers/suggestionController');
const {
    placeOrder,
    cancelOrder,
    getCreditWallet,
    applyCreditPoints,
    getSellerProductsForBuyer // Ensure this is imported for the route below
} = require('../controllers/buyerController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Routes that require authentication
router.post('/find-closest-sellers', findClosestSeller); // Now protected
router.get('/seller-prod/:sellerId', getSellerProductsForBuyer); // Now protected

// Order management routes
router.post('/place-order', placeOrder);
router.put('/cancel-order/:orderId', cancelOrder);

// Credit wallet routes
router.get('/credit-wallet/:buyerId', getCreditWallet);
router.post('/apply-credit-points/:buyerId', applyCreditPoints);


module.exports = router;