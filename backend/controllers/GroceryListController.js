const Grocery = require("../models/Grocery");
const Inventory = require("../models/Inventory");

// @desc    Get all grocery items
// @route   GET /api/groceries
exports.getAllGroceries = async (req, res) => {
    try {
        const groceries = await Grocery.find({ user: req.user.id });
        res.status(200).json(groceries);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Get single grocery item
// @route   GET /api/groceries/:id
exports.getGroceryById = async (req, res) => {
    try {
        const grocery = await Grocery.findOne({ _id: req.params.id, user: req.user.id });
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
        const newGrocery = new Grocery({
            ...req.body,
            user: req.user.id
        });
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
        const updatedGrocery = await Grocery.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
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
        const deletedGrocery = await Grocery.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!deletedGrocery) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Generate grocery report
// @route   GET /api/groceries/report
// @access  Private
const generateReport = async (req, res) => {
    try {
        console.log('Starting report generation...');
        
        // Get all groceries
        console.log('Fetching groceries...');
        const groceries = await Grocery.find({ user: req.user.id });
        console.log(`Found ${groceries.length} grocery items`);

        // Get all inventory items
        console.log('Fetching inventory...');
        const inventory = await Inventory.find({ user: req.user.id });
        console.log(`Found ${inventory.length} inventory items`);

        // Calculate total cost
        console.log('Calculating total cost...');
        const totalCost = groceries.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log(`Total cost: ${totalCost}`);

        // Group by category
        console.log('Grouping by category...');
        const categories = groceries.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
        console.log(`Categories found: ${Object.keys(categories).join(', ')}`);

        // Analyze inventory needs
        console.log('Analyzing inventory needs...');
        const inventoryNeeds = [];
        for (const item of groceries) {
            try {
                const inventoryItem = inventory.find(inv => 
                    inv.name.toLowerCase() === item.name.toLowerCase() && 
                    inv.user.toString() === req.user.id
                );

                if (!inventoryItem || inventoryItem.quantity < item.quantity) {
                    inventoryNeeds.push({
                        name: item.name,
                        needed: item.quantity - (inventoryItem?.quantity || 0),
                        unit: item.unit
                    });
                }
            } catch (error) {
                console.error(`Error processing inventory item ${item.name}:`, error);
            }
        }
        console.log(`Found ${inventoryNeeds.length} items needing inventory`);

        // Generate report
        const report = {
            totalItems: groceries.length,
            totalCost,
            categories: Object.entries(categories).map(([category, items]) => ({
                category,
                itemCount: items.length,
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    price: item.price
                }))
            })),
            inventoryNeeds,
            lastUpdated: new Date()
        };

        console.log('Report generation completed successfully');
        res.json(report);
    } catch (error) {
        console.error('Error in generateReport:', error);
        res.status(500).json({ 
            message: 'Error generating report',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
