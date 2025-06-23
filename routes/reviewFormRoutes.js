import express from 'express';
import { submitReview } from '../controllers/reviewFormController.js'; // Adjust the path if needed

const router = express.Router();

router.post('/', submitReview);

export default router;
