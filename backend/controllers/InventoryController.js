const Inventory = require("../models/Inventory");

// @desc    Get all inventory items
// @route   GET /api/inventory
exports.getAllInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find({ user: req.user.id });
        res.status(200).json(inventory);
    } catch (error) {
        console.error('Error in getAllInventory:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
exports.getInventoryById = async (req, res) => {
    try {
        const item = await Inventory.findOne({ _id: req.params.id, user: req.user.id });
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        console.error('Error in getInventoryById:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Add new inventory item
// @route   POST /api/inventory
exports.createInventory = async (req, res) => {
    try {
        console.log("Received inventory data:", req.body);
        
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
            quantity: Number(req.body.quantity),
            user: req.user._id
        };

        const newItem = new Inventory(inventoryData);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error creating inventory item:", error);
        res.status(400).json({ 
            message: "Error creating item", 
            error: error.message,
            details: error.errors
        });
    }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
exports.updateInventory = async (req, res) => {
    try {
        const updatedItem = await Inventory.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error in updateInventory:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
exports.deleteInventory = async (req, res) => {
    try {
        const deletedItem = await Inventory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error('Error in deleteInventory:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Generate inventory report
// @route   GET /api/inventory/report
exports.generateReport = async (req, res) => {
    try {
        console.log('Starting inventory report generation...');
        console.log('User ID:', req.user._id);
        
        // Fetch all inventory items for the user
        console.log('Fetching inventory items...');
        const inventory = await Inventory.find({ user: req.user._id });
        console.log(`Found ${inventory.length} inventory items`);

        if (!inventory || !Array.isArray(inventory)) {
            console.error('Invalid inventory data:', inventory);
            throw new Error('Invalid inventory data received from database');
        }

        // Group by category
        console.log('Grouping items by category...');
        const categoryGroups = inventory.reduce((groups, item) => {
            try {
                const category = item.category || 'Uncategorized';
                if (!groups[category]) {
                    groups[category] = [];
                }
                groups[category].push(item);
                return groups;
            } catch (error) {
                console.error('Error processing item for category grouping:', {
                    item,
                    error: error.message,
                    stack: error.stack
                });
                return groups;
            }
        }, {});
        console.log('Categories found:', Object.keys(categoryGroups));

        // Analyze inventory status
        console.log('Analyzing inventory status...');
        const inventoryStatus = inventory.reduce((status, item) => {
            try {
                // Check if item is low in stock (less than 20% of typical quantity)
                const typicalQuantity = item.typicalQuantity || item.quantity || 0;
                const currentQuantity = item.quantity || 0;
                const isLowStock = currentQuantity < (typicalQuantity * 0.2);
                
                // Check if item is expiring soon (within 7 days)
                const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
                const today = new Date();
                const isExpiringSoon = expiryDate && (expiryDate - today) < (7 * 24 * 60 * 60 * 1000);

                if (isLowStock) status.lowStock++;
                if (isExpiringSoon) status.expiringSoon++;
                if (currentQuantity === 0) status.outOfStock++;
                
                return status;
            } catch (error) {
                console.error('Error processing item for status analysis:', {
                    item,
                    error: error.message,
                    stack: error.stack
                });
                return status;
            }
        }, { lowStock: 0, expiringSoon: 0, outOfStock: 0 });
        console.log('Inventory status calculated:', inventoryStatus);

        console.log('Generating report structure...');
        const report = {
            totalItems: inventory.length,
            categoryBreakdown: Object.entries(categoryGroups).map(([category, items]) => {
                try {
                    return {
                        category,
                        itemCount: items.length,
                        items: items.map(item => ({
                            name: item.name,
                            quantity: item.quantity || 0,
                            unit: item.unit,
                            location: item.location,
                            expiryDate: item.expiryDate,
                            needsRestock: (item.quantity || 0) < ((item.typicalQuantity || item.quantity || 0) * 0.2),
                            expiringSoon: item.expiryDate && (new Date(item.expiryDate) - new Date()) < (7 * 24 * 60 * 60 * 1000)
                        }))
                    };
                } catch (error) {
                    console.error('Error processing category:', {
                        category,
                        error: error.message,
                        stack: error.stack
                    });
                    return {
                        category,
                        itemCount: 0,
                        items: []
                    };
                }
            }),
            inventoryStatus,
            lastUpdated: new Date().toISOString()
        };

        console.log('Report generation completed successfully');
        res.status(200).json(report);
    } catch (error) {
        console.error('Error in generateReport:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue
        });
        
        // Send more detailed error response
        res.status(500).json({ 
            message: "Error generating inventory report", 
            error: {
                message: error.message,
                name: error.name,
                code: error.code,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
    }
}; 