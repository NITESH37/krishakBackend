import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function cleanup() {
  await mongoose.connect(MONGO_URI);
  const result = await Product.deleteMany({ seller: { $exists: false } });
  console.log(`Deleted ${result.deletedCount} products without seller field.`);
  mongoose.disconnect();
}

cleanup();
