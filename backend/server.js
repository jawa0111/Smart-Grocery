require("dotenv").config();  // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json()); // To parse JSON requests
app.use(cors());         // Enable CORS

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connection Successful!"))
.catch(err => console.error(" MongoDB Connection Failed:", err));

// Test Route
app.get("/", (req, res) => {
    res.send("Smart Grocery Backend is Running!");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
});
