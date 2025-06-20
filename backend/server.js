import express from "express"
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import ProductRoutes from "./routes/products.route.js"
import CartRoutes from "./routes/cart.route.js"
import cookieParser from "cookie-parser";
// import path from "path";
import AuthRoutes from "./routes/auth.route.js"
import cors from "cors"
import OrderRoutes from "./routes/order.route.js"

const app  = express();
dotenv.config();
app.use(cors({origin:"http://localhost:5173",credentials:true}))

app.use(express.json());    //it allows us to accept json data in the req.body it is middleware
app.use(cookieParser());    //it allows us to parse incomming cookie

const PORT = process.env.PORT || 8000;

// const __dirname =path.resolve();

app.use("/api/auth",AuthRoutes)
app.use("/api/products",ProductRoutes); //allows json data in  the req.body
app.use("/api/cart",CartRoutes)
app.use("/api/orders", OrderRoutes);
// if(process.env.NODE_ENV =="production"){
//     app.use(express.static(path.join(__dirname,"/frontend/dist")));

//     app.get("*",(req,res)=>{
//         res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
//     })
// }

app.listen(PORT, ()=>{
    connectDB();
    console.log("server Started at http://localhost:"+PORT);
})