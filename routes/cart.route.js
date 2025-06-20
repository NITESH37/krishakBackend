import express from "express"
const router = express.Router();
import {verifyToken} from "../middleware/verifyToken.js"
import { getCart, addToCart, removeFromCart, clearCart } from  '../controllers/cart.controllers.js';

// Fetch cart
router.get('/',verifyToken, getCart);

// Add item to cart
router.post('/add',verifyToken,addToCart);

// Remove item from cart
router.delete('/remove', verifyToken, removeFromCart);

// Clear cart
router.delete('/clear', verifyToken, clearCart);

export default router;