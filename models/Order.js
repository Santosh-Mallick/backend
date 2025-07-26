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
                        'kg', 'g', 'ml', 'l', 'pieces', 'packs', 'bottles', 'dozen', 'units', 'boxes', 'cans'
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
    orderDate: {
        type: Date,
        default: Date.now,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
});

module.exports = mongoose.model('Order', OrderSchema);

