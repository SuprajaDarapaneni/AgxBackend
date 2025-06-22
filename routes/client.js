// routes/client.js
import express from "express";
import {
  getProducts, // Assuming this is for other client-related data, not products
  getCustomers,
  getTransactions,
  getGeography,
} from "../controllers/client.js";

import {
  addProduct,
  getallProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/Productcard.js"; // This path is correct

// --- REMOVE MULTER CONFIGURATION FOR PRODUCT IMAGE ROUTES ---
// If you have other routes that *do* need local file uploads,
// you can keep Multer and its configuration, but don't apply it
// to your product image routes.

const router = express.Router();

// Client Routes (assuming these are not related to product images)
router.get("/customers", getCustomers);
router.get("/transactions", getTransactions);
router.get("/geography", getGeography);

// Product Routes - NO LONGER USING upload.fields() for image processing
// Frontend sends Cloudinary URLs in the JSON body for these.

// Route for adding a product (expects JSON body with Cloudinary URLs)
router.post("/addproduct", addProduct);

// Route for getting a single product by ID
router.get("/getproduct/:id", getProductById);

// Route for getting all products
router.get("/getproducts", getallProducts);

// Route for updating a product (expects JSON body with Cloudinary URLs)
router.patch("/updateproduct/:id", updateProduct);

// Route for deleting a product
router.delete("/deleteproduct/:id", deleteProduct);

// Test route
router.get("/test", (req, res) => {
  res.send("Client route is working!");
});

export default router;