const Seller = require('../models/Seller');

// Call the Haversine formula to calculate distance between two coordinates
const { haversineDistance } = require('../utils/HaversianDistance');
const { getBlinkitSearchUrl } = require('../utils/BlinkitSearchURL');
// const MAX_DISTANCE_KM = 12; // Maximum distance to consider sellers within range


exports.findClosestSeller = async (req, res) => {
    const { buyerLat, buyerLon, productName, MAX_DISTANCE_KM } = req.body;

    // Input validation for buyer location and max distance
    // productName is now optional for the 'find all within range' scenario
    if (typeof buyerLat !== 'number' || typeof buyerLon !== 'number') {
        return res.status(400).json({ message: 'Missing or invalid buyer location (buyerLat, buyerLon).' });
    }

    // Default MAX_DISTANCE_KM if not provided or invalid
    const maxDistance = typeof MAX_DISTANCE_KM === 'number' && MAX_DISTANCE_KM > 0 ? MAX_DISTANCE_KM : 35; // Default to 35km if not specified

    try {
        let sellersQuery = {}; // Initialize an empty query
        let responseMessagePrefix = '';

        // Determine the query based on productName presence
        if (productName && productName.trim() !== '') {
            // Case-insensitive search for product
            sellersQuery = { products: { $in: [new RegExp(productName, 'i')] } };
            responseMessagePrefix = `offering "${productName}"`;
        } else {
            // If productName is empty, we will find all sellers
            // No specific product filter needed, so sellersQuery remains {}
            responseMessagePrefix = 'in our database';
        }

        // Find all sellers based on the determined query
        const sellers = await Seller.find(sellersQuery);

        let sellersWithinRange = [];
        let sellersBeyondRange = [];

        // Calculate distance for each relevant seller
        sellers.forEach(seller => {
            const sellerLat = seller.location.coordinates[1]; // Latitude is the second element
            const sellerLon = seller.location.coordinates[0]; // Longitude is the first element

            const distance = haversineDistance(buyerLat, buyerLon, sellerLat, sellerLon);

            if (distance <= maxDistance) {
                sellersWithinRange.push({
                    seller: seller,
                    distance: distance
                });
            } else {
                sellersBeyondRange.push({
                    seller: seller,
                    distance: distance
                });
            }
        });

        // Sort sellers by distance (closest first)
        sellersWithinRange.sort((a, b) => a.distance - b.distance);
        sellersBeyondRange.sort((a, b) => a.distance - b.distance);

        if (sellersWithinRange.length > 0) {
            // Found sellers within MAX_DISTANCE_KM
            return res.status(200).json({
                message: `Closest seller found within range.`,
                closestSeller: {
                    name: sellersWithinRange[0].seller.name,
                    phone: sellersWithinRange[0].seller.phone,
                    location: sellersWithinRange[0].seller.location,
                    products: sellersWithinRange[0].seller.products,
                    distance_km: parseFloat(sellersWithinRange[0].distance.toFixed(2))
                },
                allSellersWithinRange: sellersWithinRange.map(s => ({
                    name: s.seller.name,
                    phone: s.seller.phone,
                    id: s.seller._id,
                    products: s.seller.products,
                    distance_km: parseFloat(s.distance.toFixed(2))
                })),
                note: `There are ${sellersWithinRange.length} sellers ${responseMessagePrefix} within ${maxDistance} km.`
            });
        } else if (sellersBeyondRange.length > 0) {
            // No sellers within MAX_DISTANCE_KM, but found some beyond
            return res.status(200).json({
                message: `No sellers found ${responseMessagePrefix} within ${maxDistance} km. Closest seller found beyond range.`,
                closestSeller: {
                    name: sellersBeyondRange[0].seller.name,
                    phone: sellersBeyondRange[0].seller.phone,
                    location: sellersBeyondRange[0].seller.location,
                    products: sellersBeyondRange[0].seller.products,
                    distance_km: parseFloat(sellersBeyondRange[0].distance.toFixed(2))
                },
                allSellersBeyondRange: sellersBeyondRange.map(s => ({
                    name: s.seller.name,
                    phone: s.seller.phone,
                    distance_km: parseFloat(s.distance.toFixed(2))
                })),
                blinkitSuggestion: getBlinkitSearchUrl(productName)
            });
        } else {
            // No sellers found for the product (or any sellers if productName was empty)
            return res.status(200).json({
                message: `No sellers found ${responseMessagePrefix} in our database.`,
                blinkitSuggestion: getBlinkitSearchUrl(productName)
            });
        }

    } catch (error) {
        console.error('Error finding closest seller:', error);
        return res.status(500).json({ message: 'Server error while processing your request.' });
    }
};