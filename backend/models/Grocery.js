const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema({
    name: { type: String, required: true },  // Item Name (e.g., "Milk")
    category: { type: String, required: true }, // Category (e.g., Dairy, Vegetables)
    quantity: { type: Number, required: true, min: 1 }, // Quantity (e.g., 2 kg)
    unit: { type: String, required: true }, // Measurement Unit (kg, g, liters, etc.)
    price: { type: Number, default: 0 }, // Estimated price per unit (optional)
    totalCost: { type: Number, default: 0 }, // Auto-calculated (price × quantity)
    storeName: { type: String, default: "Unknown" }, // Store Name (Optional)
}, { timestamps: true });

// Middleware to auto-calculate totalCost before saving
grocerySchema.pre("save", function (next) {
    this.totalCost = this.price * this.quantity;
    next();
});

const Grocery = mongoose.model("Grocery", grocerySchema);
module.exports = Grocery;
