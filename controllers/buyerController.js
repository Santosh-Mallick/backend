const Order = require('../models/Order');
const Buyer = require('../models/Buyer');
const Product = require('../models/Product');

// Function to calculate eco-friendly points based on cart items
const calculateEcoFriendlyPoints = async (products) => {
  try {
    let totalEcoFriendlyBags = 0;
    
    // Mock product data for demo (matching frontend data)
    const mockProducts = {
      1: { isEcoFriendly: false },  // Tomatoes
      2: { isEcoFriendly: false },  // Organic Spinach
      3: { isEcoFriendly: false },  // Apples
      4: { isEcoFriendly: false },  // Potatoes
      5: { isEcoFriendly: false },  // Green Bell Peppers
      6: { isEcoFriendly: false },  // Bananas
      7: { isEcoFriendly: true },   // Eco-Friendly Bags (Pack of 50) - ONLY THIS EARNS POINTS
    };
    
    for (const item of products) {
      // Extract the original numeric ID from the ObjectId
      const numericId = parseInt(item.productId.slice(-2));
      const product = mockProducts[numericId];
      
      if (product && product.isEcoFriendly) {
        // For eco-friendly bags (pack of 50), multiply quantity by 50
        const itemQuantity = item.quantity.value || item.quantity || 1;
        const bagsPerPack = 50; // Each pack contains 50 bags
        const totalBags = itemQuantity * bagsPerPack;
        totalEcoFriendlyBags += totalBags;
        console.log(`Eco bag calculation: ${itemQuantity} packs × ${bagsPerPack} bags = ${totalBags} total bags`);
      }
    }
    
    // Award 1 point for every 100 eco-friendly bags
    const points = Math.floor(totalEcoFriendlyBags / 100);
    console.log(`Eco-friendly calculation: ${totalEcoFriendlyBags} bags = ${points} points`);
    return points;
  } catch (error) {
    console.error('Error calculating eco-friendly points:', error);
    return 0;
  }
};

// Function to award credit points for eco-friendly bag usage
const awardEcoFriendlyPoints = async (buyerId, points = 1) => {
  try {
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      throw new Error('Buyer not found');
    }

    buyer.creditWallet.points += points;
    buyer.creditWallet.totalEarned += points;
    buyer.ecoPoints += points; // Also increment ecoPoints for backward compatibility

    await buyer.save();
    return buyer.creditWallet;
  } catch (error) {
    console.error('Error awarding eco-friendly points:', error);
    throw error;
  }
};

// Function to use credit points during payment
const useCreditPoints = async (buyerId, pointsToUse) => {
  try {
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      throw new Error('Buyer not found');
    }

    if (buyer.creditWallet.points < pointsToUse) {
      throw new Error('Insufficient credit points');
    }

    buyer.creditWallet.points -= pointsToUse;
    buyer.creditWallet.totalUsed += pointsToUse;

    await buyer.save();
    return buyer.creditWallet;
  } catch (error) {
    console.error('Error using credit points:', error);
    throw error;
  }
};

const placeOrder = async (req, res) => {
    try {
        const { products, sellerId, buyerId, totalAmount, shippingAddress } = req.body;

        // Validate required fields
        if (!products || !sellerId || !buyerId || !totalAmount || !shippingAddress) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Convert numeric product IDs to valid ObjectIds for demo purposes
        const processedProducts = products.map(item => ({
            ...item,
            productId: typeof item.productId === 'number' 
                ? `507f1f77bcf86cd7994390${item.productId.toString().padStart(2, '0')}` 
                : item.productId
        }));

        // Create a new order
        const newOrder = new Order({
            products: processedProducts,
            sellerId,
            buyerId,
            totalPrice: totalAmount,
            shippingAddress,
            status: 'Pending', // Default status
            createdAt: new Date(),
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        // Calculate and award credit points based on eco-friendly bags in cart
        let creditWallet = null;
        let ecoFriendlyPointsAwarded = 0;
        
        try {
            ecoFriendlyPointsAwarded = await calculateEcoFriendlyPoints(processedProducts);
            console.log(`Points calculated: ${ecoFriendlyPointsAwarded}`);
            
            if (ecoFriendlyPointsAwarded > 0) {
                creditWallet = await awardEcoFriendlyPoints(buyerId, ecoFriendlyPointsAwarded);
                console.log(`Points awarded successfully. New wallet:`, creditWallet);
            } else {
                console.log('No eco-friendly points to award');
            }
        } catch (error) {
            console.error('Error awarding eco-friendly points:', error);
            // Don't fail the order if points awarding fails
        }

        res.status(201).json({
            message: 'Order placed successfully',
            order: savedOrder,
            creditWallet: creditWallet,
            ecoFriendlyPointsAwarded: ecoFriendlyPointsAwarded
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Validate required fields
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order can be canceled
        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending orders can be canceled' });
        }

        // Update the order status to 'Canceled'
        order.status = 'Canceled';
        const updatedOrder = await order.save();

        res.status(200).json({
            message: 'Order canceled successfully',
            order: updatedOrder,
        });
    } catch (error) {
        console.error('Error canceling order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get buyer's credit wallet information
const getCreditWallet = async (req, res) => {
    try {
        const { buyerId } = req.params;

        const buyer = await Buyer.findById(buyerId).select('creditWallet ecoPoints');
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        res.status(200).json({
            creditWallet: buyer.creditWallet,
            ecoPoints: buyer.ecoPoints,
            pointValue: 10 // 1 point = ₹10
        });
    } catch (error) {
        console.error('Error getting credit wallet:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Apply credit points to payment
const applyCreditPoints = async (req, res) => {
    try {
        const { buyerId } = req.params;
        const { pointsToUse } = req.body;

        if (!pointsToUse || pointsToUse <= 0) {
            return res.status(400).json({ message: 'Valid number of points required' });
        }

        const creditWallet = await useCreditPoints(buyerId, pointsToUse);
        const discountAmount = pointsToUse * 10; // 1 point = ₹10

        res.status(200).json({
            message: 'Credit points applied successfully',
            creditWallet: creditWallet,
            pointsUsed: pointsToUse,
            discountAmount: discountAmount
        });
    } catch (error) {
        console.error('Error applying credit points:', error);
        if (error.message === 'Insufficient credit points') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { 
    placeOrder, 
    cancelOrder, 
    getCreditWallet, 
    applyCreditPoints,
    awardEcoFriendlyPoints,
    useCreditPoints,
    calculateEcoFriendlyPoints
};