// backend/controllers/productController.js

import Productcard from "../models/Productcard.js"; // Ensure this path is correct

// --- GET all products ---
export const getallProducts = async (req, res) => {
  try {
    const products = await Productcard.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// --- GET single product by ID ---
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Productcard.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product by ID ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// --- Add a new product ---
export const addProduct = async (req, res) => {
  try {
    // Extract all expected fields from req.body, INCLUDING image URLs
    // The frontend sends the Cloudinary URLs directly in the body
    const {
      name,
      category,
      description,
      bannerTitle,
      introduction,
      productRange,
      additionalInfo,
      whyChooseUs,
      coverImage,    // This will be the Cloudinary URL string
      multipleImages // This will be an array of Cloudinary URL strings
    } = req.body;

    // Basic validation: Ensure core fields are present
    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required." });
    }
    // You can add validation for coverImage if it's always required
    // if (!coverImage) {
    //   return res.status(400).json({ message: "Cover image URL is required." });
    // }

    const newProduct = new Productcard({
      name,
      category,
      description,
      bannerTitle,
      introduction,
      productRange,
      additionalInfo,
      whyChooseUs,
      coverImage: coverImage,         // Store the Cloudinary URL
      multipleImages: multipleImages, // Store the array of Cloudinary URLs
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    // No local file cleanup is needed as images are external (Cloudinary)
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

// --- Update an existing product ---
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Extract ALL expected fields from req.body, INCLUDING image URLs
    const {
      name,
      category,
      description,
      bannerTitle,
      introduction,
      productRange,
      additionalInfo,
      whyChooseUs,
      coverImage,    // This will be the Cloudinary URL string (or null/empty if cleared)
      multipleImages // This will be an array of Cloudinary URL strings (or empty array if cleared)
    } = req.body;

    const product = await Productcard.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedData = {};

    // Conditionally add fields to updatedData only if they are explicitly provided in the request body.
    // This allows for partial updates and updating fields to empty strings/arrays.
    if (name !== undefined) updatedData.name = name;
    if (category !== undefined) updatedData.category = category;
    if (description !== undefined) updatedData.description = description;
    if (bannerTitle !== undefined) updatedData.bannerTitle = bannerTitle;
    if (introduction !== undefined) updatedData.introduction = introduction;
    if (productRange !== undefined) updatedData.productRange = productRange;
    if (additionalInfo !== undefined) updatedData.additionalInfo = additionalInfo;
    if (whyChooseUs !== undefined) updatedData.whyChooseUs = whyChooseUs;

    // Handle image URLs: The frontend is responsible for uploading to Cloudinary
    // and sending the correct (new or existing) URLs to the backend.
    if (coverImage !== undefined) {
        updatedData.coverImage = coverImage;
    }
    if (multipleImages !== undefined) {
        updatedData.multipleImages = multipleImages;
    }

    const updatedProduct = await Productcard.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    // No local file cleanup is needed as images are external (Cloudinary)
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// --- DELETE product ---
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Productcard.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // IMPORTANT: If you want to delete images from Cloudinary when a product is deleted,
    // you would add Cloudinary API calls here to destroy the images by their public_ids.
    // This requires Cloudinary's Node.js SDK and proper authentication.
    // Example (requires 'cloudinary' package and config):
    /*
    import { v2 as cloudinary } from 'cloudinary';
    // Configure Cloudinary with your API credentials
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    if (product.coverImage) {
      const publicId = product.coverImage.split('/').pop().split('.')[0]; // Extract public_id from URL
      await cloudinary.uploader.destroy(publicId);
    }
    if (product.multipleImages && product.multipleImages.length > 0) {
      for (const imageUrl of product.multipleImages) {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }
    */

    await Productcard.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};