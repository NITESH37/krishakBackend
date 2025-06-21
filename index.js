import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/db.js";
import AuthRoutes from "./routes/auth.route.js";
import ProductRoutes from "./routes/products.route.js";
import CartRoutes from "./routes/cart.route.js";
import OrderRoutes from "./routes/order.route.js";

dotenv.config();

const app = express();

/* 1️⃣  CORS – allow both local dev & deployed frontend domain */
app.use(
  cors({
    // Correctly include your frontend's Netlify URL
    origin: [
      "http://localhost:5173",
      "https://symphonious-marigold-cec936.netlify.app",
      "https://krishak-frontend.vercel.app/",
      "https://krishak.shop",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Include all methods your API uses
    allowedHeaders: "Content-Type,Authorization", // Important if you send custom headers
    credentials: true, // Crucial if your frontend sends cookies or Authorization headers
    optionsSuccessStatus: 204, // For preflight requests
  })
);

/* 2️⃣  Middle‑ware */
app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Parses cookies attached to the client request object

/* 3️⃣  Routes */
app.get("/", (_, res) => res.send("API is running 🚀"));
app.use("/api/auth", AuthRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", OrderRoutes);

// Add a general 404 handler for any undefined routes
app.use((req, res, next) => {
  res.status(404).send("API route not found.");
});

/* 4️⃣  Connect DB *before* we start listening */
// Ensure connectDB is an async function and is awaited
// Wrap in an async IIFE or use .then/.catch if not using top-level await
(async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully.");
    /* 5️⃣  Start server on the port Render gives us */
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB or start server:", error);
    process.exit(1); // Exit process with failure
  }
})();
