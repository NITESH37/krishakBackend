import express from "express"
import { createProduct, deleteProduct, getProduct,  updateProduct, getSingleProduct } from "../controllers/product.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.get("/", getProduct)

router.post("/", verifyToken, createProduct)

router.put("/:id",verifyToken, updateProduct);

router.delete("/:id",verifyToken,deleteProduct);

// Get single product by ID
router.get("/:id", getSingleProduct);
 
export default router;