const Order = require('../models/Order'); // Assuming you have an Order model
const Seller = require('../models/Seller');
const Product = require('../models/Product');

const placeOrder = async (req, res) => {
    try {
        const { products, sellerId, buyerId, totalAmount, shippingAddress } = req.body;

        // Validate required fields
        if (!products || !sellerId || !buyerId || !totalAmount || !shippingAddress) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new order
        const newOrder = new Order({
            products,
            sellerId,
            buyerId,
            totalPrice: totalAmount,
            status: 'Pending', // Default status
            createdAt: new Date(),
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        res.status(201).json({
            message: 'Order placed successfully',
            order: savedOrder,
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

const getSellerProductsForBuyer = async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Validate seller ID
        if (!sellerId) {
            return res.status(400).json({ message: 'Seller ID is required' });
        }

        // Find the seller by ID
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Find all products for this seller
        const allProducts = await Product.find({ seller: sellerId });

        // Separate products with quantity 0
        const productsWithZeroQuantity = allProducts.filter(product => product.quantity === 0);
        const otherProducts = allProducts.filter(product => product.quantity > 0);

        res.status(200).json({
            message: 'Products retrieved successfully',
            products: {
                available: otherProducts,
                outOfStock: productsWithZeroQuantity
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { placeOrder, cancelOrder, getSellerProductsForBuyer };