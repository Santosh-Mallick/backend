const Seller = require('../models/Seller');

// Call the Haversine formula to calculate distance between two coordinates
const { calculateHaversineDistance } = require('../utils/HaversianDistance');
const { getBlinkitSearchUrl } = require('../utils/BlinkitSearchURL');
// const MAX_DISTANCE_KM = 12; // Maximum distance to consider sellers within range


exports.findClosestSeller = async (req, res) => {
    const { buyerLat, buyerLon, productName, MAX_DISTANCE_KM } = req.body;

    // Input validation
    if (typeof buyerLat !== 'number' || typeof buyerLon !== 'number' || !productName) {
        return res.status(400).json({ message: 'Missing or invalid buyer location or product name.' });
    }

    try {
        // Find all sellers who offer the requested product
        const sellers = await Seller.find({ products: { $in: [new RegExp(productName, 'i')] } }); // Case-insensitive search

        let sellersWithinRange = [];
        let sellersBeyondRange = [];

        // Calculate distance for each relevant seller
        sellers.forEach(seller => {
            const sellerLat = seller.location.coordinates[1]; // Latitude is the second element
            const sellerLon = seller.location.coordinates[0]; // Longitude is the first element

            const distance = calculateHaversineDistance(buyerLat, buyerLon, sellerLat, sellerLon);

            if (distance <= MAX_DISTANCE_KM) {
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
            // Found sellers within 35km, return the closest one
            return res.status(200).json({
                message: 'Closest seller found within range.',
                closestSeller: {
                    name: sellersWithinRange[0].seller.name,
                    location: sellersWithinRange[0].seller.location,
                    products: sellersWithinRange[0].seller.products,
                    distance_km: parseFloat(sellersWithinRange[0].distance.toFixed(2))
                },
                allSellersWithinRange: sellersWithinRange.map(s => ({
                    name: s.seller.name,
                    distance_km: parseFloat(s.distance.toFixed(2))
                })),
                note: `There are ${sellersWithinRange.length} sellers offering "${productName}" within ${MAX_DISTANCE_KM} km.`
            });
        } else if (sellersBeyondRange.length > 0) {
            // No sellers within 35km, but found some beyond
            return res.status(200).json({
                message: `No sellers found within ${MAX_DISTANCE_KM} km. Closest seller found beyond range.`,
                closestSeller: {
                    name: sellersBeyondRange[0].seller.name,
                    location: sellersBeyondRange[0].seller.location,
                    products: sellersBeyondRange[0].seller.products,
                    distance_km: parseFloat(sellersBeyondRange[0].distance.toFixed(2))
                },
                allSellersBeyondRange: sellersBeyondRange.map(s => ({
                    name: s.seller.name,
                    distance_km: parseFloat(s.distance.toFixed(2))
                })),
                blinkitSuggestion: getBlinkitSearchUrl(productName)
            });
        } else {
            // No sellers found for the product at all
            return res.status(200).json({
                message: `No sellers found offering "${productName}" in our database.`,
                blinkitSuggestion: getBlinkitSearchUrl(productName)
            });
        }

    } catch (error) {
        console.error('Error finding closest seller:', error);
        return res.status(500).json({ message: 'Server error while processing your request.' });
    }
};