const Inventory = require("../models/Inventory");

// @desc    Get all inventory items
// @route   GET /api/inventory
exports.getAllInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
exports.getInventoryById = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Add new inventory item
// @route   POST /api/inventory
exports.createInventory = async (req, res) => {
    try {
        console.log("Received inventory data:", req.body); // Log the received data
        
        // Validate required fields
        const requiredFields = ['name', 'category', 'quantity', 'unit', 'expiryDate', 'location'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: "Missing required fields", 
                missingFields 
            });
        }

        // Convert quantity to number if it's a string
        const inventoryData = {
            ...req.body,
            quantity: Number(req.body.quantity)
        };

        const newItem = new Inventory(inventoryData);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error creating inventory item:", error); // Log the error
        res.status(400).json({ 
            message: "Error creating item", 
            error: error.message,
            details: error.errors // Include validation errors if any
        });
    }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
exports.updateInventory = async (req, res) => {
    try {
        const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
exports.deleteInventory = async (req, res) => {
    try {
        const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}; 