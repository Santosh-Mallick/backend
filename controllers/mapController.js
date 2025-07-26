const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

const getDistance = (req, res) => {
    const { lat1, lon1, lat2, lon2 } = req.body;

    if (!lat1 || !lon1 || !lat2 || !lon2) {
        return res.status(400).json({ error: "All coordinates (lat1, lon1, lat2, lon2) are required." });
    }

    const distance = haversineDistance(lat1, lon1, lat2, lon2);
    return res.status(200).json({ distance });
};

module.exports = { getDistance };