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

/* 1️⃣  CORS – allow both local dev & Render domain */
const allowedOrigins = [
  // Add your localhost development URL here
  "http://localhost:5173",
  // Your deployed frontend URL
  "https://symphonious-marigold-cec936.netlify.app", // Removed trailing slash for consistency, though 'cors' usually handles it.
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      // and requests from the allowedOrigins list.
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
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

/* 4️⃣  Connect DB *before* we start listening */
// Ensure connectDB is an async function and is awaited
await connectDB();

/* 5️⃣  Start server on the port Render gives us */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
