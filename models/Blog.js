// Example Blog.js schema (assuming you have one similar)
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
   
  },
  excerpt: {
    type: String,
    maxlength: 200, // As per your UI suggestion
  },
  content: {
    type: String,
     
  },
  image: {           // <-- Add this
    type: String,    // Will store the URL of the image
    default: null,   // Or undefined, or an empty string, depending on your preference
  },
  video: {           // <-- Add this
    type: String,    // Will store the URL of the video
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;