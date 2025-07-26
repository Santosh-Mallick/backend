// models/Buyer.js
const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    }
  ],
  totalAmount: Number,
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  ecoBagUsed: {
    type: Boolean,
    default: false,
  }
}, { _id: false }); // prevent sub-document ID

const buyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  address: {
    line: String,
    locality: String,
    city: String,
    pincode: String,
    state: String,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  orderHistory: [orderHistorySchema],
  ecoPoints: {
    type: Number,
    default: 0, // Earned for eco-friendly bag usage
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Buyer",
  },
}, {
  timestamps: true,
});

buyerSchema.index({ location: "2dsphere" }); // For nearby food stall queries

module.exports = mongoose.model("Buyer", buyerSchema);