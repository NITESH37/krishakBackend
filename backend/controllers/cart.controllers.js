import Cart from "../models/cart.model.js"

// Fetch user's cart
export const getCart = async (req, res) => {
   
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized: User not found' 
            });
        }

        // Fetch the user's cart
        const cart = await Cart.findOne({ userId: req.user.userId })
            .populate('items.productId', 'name price seller _id'); 
            
        // Return empty cart if none exists
        if (!cart) {
            return res.status(200).json({ 
                success: true, 
                message: 'Cart is empty', 
                cart: { items: [], subTotal: 0 } 
            });
        }

        // Filter out items with invalid products and recalculate subtotal
        const validItems = cart.items.filter(item => item.productId !== null);
        if (validItems.length !== cart.items.length) {
            console.log(`Filtered out ${cart.items.length - validItems.length} invalid items from cart`);
            cart.items = validItems;
            cart.subTotal = validItems.reduce((sum, item) => sum + item.total, 0);
            await cart.save();
        }

        // Return the populated cart
        res.status(200).json({ 
            success: true, 
            message: 'Cart fetched successfully', 
            cart 
        });
    } catch (error) {
        console.error('Error in getCart:', error);
        // Standardized error response
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching cart', 
            error: error.message 
        });
    }
};


// Add item to cart
export const addToCart = async (req, res) => {
    const { productId, quantity, price,image } = req.body;
    
    if (!productId || !quantity || !price) {
        return res.status(400).json({ message: 'Product ID, quantity, and price are required' });
    }

    if (quantity <= 0 || price <= 0) {
        return res.status(400).json({ message: 'Quantity and price must be greater than 0' });
    }
    try {
        let cart = await Cart.findOne({ "userId" : req.user.userId });
        
        if (cart) {
            // Find if the item already exists in the cart
            const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
            
            if (itemIndex > -1) {
                // If the item exists
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].total = cart.items[itemIndex].quantity * price;
            } else {
                // If the item does not exist
                cart.items.push({ productId, quantity, price,image, total: quantity * price });
            }
        } else {
            
            // If the cart doesn't exist create a new one
            cart = new Cart({
                "userId": req.user.userId,
                items: [{ productId, quantity, price,image, total: quantity * price }],
            });
            
        }

        // Save 
        await cart.save();
        res.status(200).json({ success: true, message: 'Item added to cart', cart });
    } catch (error) {

        // Handle errors
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
};


// Remove item from cart
export const removeFromCart = async (req, res) => {
    const productId = req.body.productId || req.query.productId || (req.body && req.body.data && req.body.data.productId);
    
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized: User not found' 
        });
    }

    if (!productId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Product ID is required' 
        });
    }

    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        // Check if item exists in cart
        const itemExists = cart.items.some(item => item.productId.toString() === productId);
        if (!itemExists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found in cart' 
            });
        }

        // Remove the item
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
        
        // Recalculate subtotal
        cart.subTotal = cart.items.reduce((total, item) => total + item.total, 0);

        await cart.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Item removed from cart', 
            cart 
        });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error removing item from cart', 
            error: error.message 
        });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized: User not found' 
            });
        }

        const cart = await Cart.findOneAndUpdate(
            { userId: req.user.userId },
            { items: [], subTotal: 0 },
            { new: true }
        );
        
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Cart cleared successfully', 
            cart 
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error clearing cart', 
            error: error.message 
        });
    }
};


