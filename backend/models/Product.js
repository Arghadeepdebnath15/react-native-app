const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  reviews: [ReviewSchema],
  avgRating: {
    type: Number,
    default: 0
  }
});

// Calculate average rating when reviews are added or updated
ProductSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.avgRating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
  } else {
    this.avgRating = 0;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema); 