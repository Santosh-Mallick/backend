const express = require('express');
const { getDistance } = require('../controllers/mapController');

const router = express.Router();

router.post("/get-distance", getDistance);

// Export the router
module.exports = router;