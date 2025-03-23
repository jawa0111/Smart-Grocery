const Grocery = require("../models/Grocery");

// @desc    Get all grocery items
// @route   GET /api/groceries
exports.getAllGroceries = async (req, res) => {
    try {
        const groceries = await Grocery.find();
        res.status(200).json(groceries);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Get single grocery item
// @route   GET /api/groceries/:id
exports.getGroceryById = async (req, res) => {
    try {
        const grocery = await Grocery.findById(req.params.id);
        if (!grocery) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(grocery);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Add new grocery item
// @route   POST /api/groceries
exports.createGrocery = async (req, res) => {
    try {
        const newGrocery = new Grocery(req.body);
        await newGrocery.save();
        res.status(201).json(newGrocery);
    } catch (error) {
        res.status(400).json({ message: "Error creating item", error });
    }
};

// @desc    Update grocery item
// @route   PUT /api/groceries/:id
exports.updateGrocery = async (req, res) => {
    try {
        const updatedGrocery = await Grocery.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGrocery) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(updatedGrocery);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Delete grocery item
// @route   DELETE /api/groceries/:id
exports.deleteGrocery = async (req, res) => {
    try {
        const deletedGrocery = await Grocery.findByIdAndDelete(req.params.id);
        if (!deletedGrocery) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
