import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// Create a new order (user places an order)
export const createOrder = async (req, res) => {
  try {
    const { product, quantity, price, address } = req.body;
    console.log("Creating order with data:", { product, quantity, price, address });
    console.log("User ID from token:", req.userId);
    
    if (!product || !quantity || !price || !address) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    // Find product and seller
    const prod = await Product.findById(product).populate('seller', 'name email');
    console.log("Found product:", prod);
    
    if (!prod) return res.status(404).json({ success: false, message: "Product not found" });
    if (!prod.seller) {
      console.error("Product without seller found:", prod._id, prod.name);
      return res.status(400).json({ 
        success: false, 
        message: "Product has no seller information. Please contact support." 
      });
    }
    
    console.log("Product seller ID:", prod.seller);
    
    // Create order
    const order = new Order({
      product,
      seller: prod.seller._id || prod.seller,
      buyer: req.userId,
      quantity,
      price,
      address
    });
    
    console.log("Order object before save:", order);
    await order.save();
    console.log("Order saved successfully:", order._id);
    
    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all orders received by a seller
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userId;
    console.log("Getting orders for seller:", sellerId);
    
    const orders = await Order.find({ seller: sellerId })
      .populate("product", "name description image")
      .populate("buyer", "name email phone");
    
    console.log("Found orders:", orders.length);
    console.log("Orders data:", orders);
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Error getting seller orders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all orders placed by a user (buyer)
export const getUserOrders = async (req, res) => {
  try {
    console.log("getUserOrders called");
    console.log("req.userId:", req.userId);
    console.log("req.user:", req.user);
    
    if (!req.userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User ID not found in request" 
      });
    }

    const buyerId = req.userId;
    console.log("Getting orders for buyer:", buyerId);
    
    const orders = await Order.find({ buyer: buyerId })
      .populate("product", "name description image category")
      .populate("seller", "name email")
      .sort({ createdAt: -1 }); // Most recent first
    
    console.log("Found user orders:", orders.length);
    console.log("Orders:", orders);
    
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Error getting user orders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete an order (seller can delete their orders)
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Delete order request - Order ID:', orderId);
    console.log('User ID from token:', req.userId);
    
    if (!req.userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ 
        success: false, 
        message: "User ID not found in request" 
      });
    }

    // Find the order and check if the user is the seller
    const order = await Order.findById(orderId);
    console.log('Found order:', order);
    
    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check if the user is the seller of this order
    console.log('Order seller ID:', order.seller.toString());
    console.log('Request user ID:', req.userId);
    console.log('Are they equal?', order.seller.toString() === req.userId);
    
    if (order.seller.toString() !== req.userId) {
      console.log('User is not the seller of this order');
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own orders" 
      });
    }

    // Delete the order
    console.log('Deleting order...');
    await Order.findByIdAndDelete(orderId);
    console.log('Order deleted successfully');
    
    res.status(200).json({ 
      success: true, 
      message: "Order deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel an order (seller can cancel their orders)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "User ID not found in request" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.seller.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "You can only cancel your own orders" });
    }
    order.status = "cancelled";
    await order.save();
    res.status(200).json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Accept an order (seller can accept their orders)
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "User ID not found in request" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.seller.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "You can only accept your own orders" });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: `Order is already ${order.status}` });
    }
    order.status = "completed";
    await order.save();
    res.status(200).json({ success: true, message: "Order accepted successfully", order });
  } catch (err) {
    console.error("Error accepting order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
