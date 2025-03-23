require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const groceryRoutes = require("./routes/groceryRoutes"); // Import routes

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors());         // Enable CORS

// Connect to MongoDB (Updated: Removed deprecated options)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connection Successful!"))
    .catch(err => console.error("MongoDB Connection Failed:", err));

// Test Route
app.get("/", (req, res) => {
    res.send("Smart Grocery Backend is Running!");
});

// Use Grocery Routes
app.use("/api/groceries", groceryRoutes);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
