import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import contactRoutes from "./routes/contact.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import reviewFormRoutes from "./routes/reviewFormRoutes.js";

// Data Models
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";
import Productcard from "./models/Productcard.js";
import Contact from "./models/ContactUs.js";

// Optional sample data
import {
  dataUser,
  dataProduct,
  dataProductStat,
  dataTransaction,
  dataOverallStat,
  dataAffiliateStat,
} from "./data/index.js";

// Load environment variables
dotenv.config();

/* Express App Initialization */
const app = express();

/* Middleware Configuration */
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* CORS Configuration */
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.agx-international.com",
  "https://agx-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., curl or mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use("/uploads", express.static(" "));

/* Routes */
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/auth", authRoutes);
app.use("/", contactRoutes);
app.use("/blogs", blogRoutes);
app.use("/reviews", reviewRoutes);
app.use("/reviewform", reviewFormRoutes);

/* MongoDB Connection & Server Start */
const PORT = process.env.PORT || 9000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/ecomm";

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port: ${PORT}`);
  });

  /* Optional: Seed database ONCE */
  // User.insertMany(dataUser);
  // Product.insertMany(dataProduct);
  // ProductStat.insertMany(dataProductStat);
  // Transaction.insertMany(dataTransaction);
  // OverallStat.insertMany(dataOverallStat);
  // AffiliateStat.insertMany(dataAffiliateStat);
})
.catch((error) => {
  console.error("❌ MongoDB connection failed:", error);
});
