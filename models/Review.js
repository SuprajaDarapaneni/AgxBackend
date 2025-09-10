// models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
    imageUrl: { type: String, default: null }, 
});

export default mongoose.model('Review', reviewSchema);
