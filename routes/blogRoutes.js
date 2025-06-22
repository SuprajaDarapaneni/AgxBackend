import express from 'express';
import Blog from '../models/Blog.js'; // Don't forget `.js` if using ES Modules

const router = express.Router();

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching all blogs:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    console.error(`Error fetching blog with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

// Create blog
router.post('/', async (req, res) => {
  const { title, excerpt, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newBlog = new Blog({ title, excerpt, content });

  try {
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Error creating new blog:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update blog
router.put('/:id', async (req, res) => {
  const { title, excerpt, content,image,video } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (title !== undefined) blog.title = title;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (content !== undefined) blog.content = content;
      if (image !== undefined) blog.image = image;   // <-- Added
    if (video !== undefined) blog.video = video;   // <-- Added


    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    console.error(`Error updating blog with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error(`Error deleting blog with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

export default router; // ✅ ES module default export
