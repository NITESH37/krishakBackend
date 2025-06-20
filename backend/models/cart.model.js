import mongoose from "mongoose"

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                image:{
                    type:String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                total: {
                    type: Number,
                    required: true,
                },
            },
        ],
        subTotal: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true } // Automatically add `createdAt` and `updatedAt`
);

// Pre-save middleware to calculate the subtotal
cartSchema.pre('save', function (next) {
    this.subTotal = this.items.reduce((sum, item) => sum + item.total, 0);
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;


