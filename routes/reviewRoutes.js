import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new review
router.post('/', async (req, res) => {
  const { name, rating, comment } = req.body;
  console.log('Received data:', req.body); // ✅ Debug log

  if (!name || !rating || !comment) {
    return res.status(400).json({ message: 'Name, rating and comment are required' });
  }

  try {
    const newReview = new Review({ name, rating, comment });
    const savedReview = await newReview.save();
    console.log('Saved review:', savedReview); // ✅ Debug log
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error saving review:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// DELETE a review by ID
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await review.remove();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
