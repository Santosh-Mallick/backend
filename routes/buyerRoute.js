const express = require('express');
const router = express.Router();

const { findClosestSeller } = require('../controllers/suggestionController');
router.post('/find-closest-sellers', findClosestSeller);

// Export the router
module.exports = router;