const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.set("strictQuery", false);

    try {
        const connecting = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Serverni tanlash uchun 5 soniya timeout
            socketTimeoutMS: 45000,         // 45 soniya
            connectTimeoutMS: 30000         // 30 soniya
        });

        console.log(`MongoDB ga ulandi: ${connecting.connection.host}`.bgBlue);
    } catch (error) {
        console.error('MongoDB ulanishida xato:', error);
        process.exit(1); // Ilovani to'xtatish
    }
};

module.exports = connectDB;
