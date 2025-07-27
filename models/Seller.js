// models/Seller.js
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Stall/Shop Name
  },
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Don't return password in queries
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
      // [longitude, latitude]
      type: [Number],
      required: true,
    },
  },
  products: [{
    type: String, // Product names
  }],
  shopPhoto: {
    type: String, // URL (e.g., Cloudinary)
  },
  bannerImage: {
    type: String,
  },
  fssaiNumber: {
    type: String,
    required: true,
    unique: true,
  },
  categories: [{
    type: String, // e.g., "Groceries", "Fruits", "Vegetables"
  }],
  isOpen: {
    type: Boolean,
    default: false,
  },
  openingHours: {
    open: String,  // e.g., "10:00 AM"
    close: String, // e.g., "10:00 PM"
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
  paymentInfo: {
    upiId: String,
    bankAccountNumber: String,
    ifscCode: String,
    accountHolderName: String,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

sellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

sellerSchema.index({ location: "2dsphere" }); // For geo queries

module.exports = mongoose.model("Seller", sellerSchema);
