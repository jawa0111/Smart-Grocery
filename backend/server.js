const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");  // Required for Socket.io
const connectDB = require("./config/db");
const groceryRoutes = require("./routes/groceryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const familyInvitationRoutes = require("./routes/familyInvitationRoutes");

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);  // Create HTTP server

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running with Socket.io!' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groceries", groceryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/family-invitations", familyInvitationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;

// Debug port information
console.log('Attempting to start server on port:', PORT);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server at http://localhost:${PORT}/api/test`);
});
