import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { createOrder, getSellerOrders, getUserOrders, deleteOrder, cancelOrder, acceptOrder } from "../controllers/order.controller.js";

const router = express.Router();

// User places an order
router.post("/", verifyToken, createOrder);

// Seller gets all received orders
router.get("/received", verifyToken, getSellerOrders);

// User gets their order history
router.get("/history", verifyToken, getUserOrders);

// Seller deletes an order
router.delete("/:orderId", verifyToken, deleteOrder);

// Seller cancels an order
router.patch("/:orderId/cancel", verifyToken, cancelOrder);

// Seller accepts an order
router.patch("/:orderId/accept", verifyToken, acceptOrder);

export default router;
