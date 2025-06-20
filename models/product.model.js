import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    price:{
        type:Number,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    unit:{
        type:String,
        required: true,
        default:"kg"
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        enum: [
            'vegetable',
            'fruit',
            'homemade',
            'grain',
            'pulse',
            'dairy'
        ],
        required: true
    }
},
{timestamps:true}

)

const Product = mongoose.model("Product",productSchema);

export default Product;