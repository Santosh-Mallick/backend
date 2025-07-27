const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    per_unit: {
        type: Number,
        required: true,
        default: 1, // Default to 1 if not specified
    },
    unit: {
        type: String,
        enum: ['pieces', 'kg', 'gram', 'litre', 'ml', 'packet'],
        required: true,
    },
    pricePerUnitOption: {
        type: String,
        enum: ['pieces', 'kg', 'gram', 'litre', 'ml', 'packet'],
        required: true,
        default: 'pieces',
    },
    image: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', ProductSchema);
