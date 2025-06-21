// server.js (or index.js)

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
  // e.g. https://krishak.shop
  "https://symphonious-marigold-cec936.netlify.app/",
];
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed")),
    credentials: true,
  })
);

/* 2️⃣  Middle‑ware */
app.use(express.json());
app.use(cookieParser());

/* 3️⃣  Routes */
app.get("/", (_, res) => res.send("API is running 🚀"));
app.use("/api/auth", AuthRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", OrderRoutes);

/* 4️⃣  Connect DB *before* we start listening */
await connectDB();

/* 5️⃣  Start server on the port Render gives us */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
