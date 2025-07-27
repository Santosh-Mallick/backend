const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            // Modified quantity to be an object
            quantity: {
                value: { // The numerical part of the quantity (e.g., 1, 10)
                    type: Number,
                    required: true,
                    min: 1, // Quantity should be at least 1
                },
                unit: { // The unit of the quantity (e.g., 'kg', 'pieces')
                    type: String,
                    required: true,
                    enum: [ // Define an enum for common units to ensure consistency
                        'kg', 'g', 'ml', 'l', 'pieces', 'piece', 'packs', 'pack', 'bottles', 'dozen', 'units', 'boxes', 'cans', 'bunch'
                    ],
                    default: 'pieces', // A sensible default unit if not specified
                },
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer',
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    shippingAddress: {
        line: String,
        locality: String,
        city: String,
        pincode: String,
        state: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
});

module.exports = mongoose.model('Order', OrderSchema);

