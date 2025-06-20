import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI;
        
        // Add mongodb:// scheme if not present
        if (mongoUri && !mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
            mongoUri = `mongodb://${mongoUri}`;
        }
        
        // Use default local MongoDB if no URI provided
        if (!mongoUri) {
            mongoUri = 'mongodb://localhost:27017/mern';
        }
        
        const conn = await mongoose.connect(`${mongoUri}/mern`);
        console.log(`MongoDB connected :${conn.connection.host}`);

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}