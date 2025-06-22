import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';

const router = express.Router();

// Dummy admin authentication middleware (replace with real auth)
const authenticateAdmin = (req, res, next) => {
  // TODO: replace with real auth check
  next();
};

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new review with validation
router.post('/', async (req, res) => {
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: 'Name, rating, and comment are required.' });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name must be a non-empty string.' });
  }

  if (typeof comment !== 'string' || comment.trim().length === 0) {
    return res.status(400).json({ message: 'Comment must be a non-empty string.' });
  }

  try {
    const newReview = new Review({ name: name.trim(), rating, comment: comment.trim() });
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a review by ID - protected by admin auth middleware
router.delete('/:id', authenticateAdmin, async (req, res) => {
  const id = req.params.id;

  // Validate MongoDB ObjectId format before querying
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID.' });
  }

  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    // Use deleteOne instead of deprecated remove
    await review.deleteOne();
    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
