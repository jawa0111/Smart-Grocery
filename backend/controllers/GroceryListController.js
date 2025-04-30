const Grocery = require("../models/Grocery");
const Inventory = require("../models/Inventory");

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

// @desc    Generate grocery list report
// @route   GET /api/groceries/report
exports.generateReport = async (req, res) => {
    try {
        console.log('Starting report generation...');
        
        // Fetch groceries
        console.log('Fetching groceries...');
        const groceries = await Grocery.find();
        console.log(`Found ${groceries.length} grocery items`);
        
        // Fetch inventory
        console.log('Fetching inventory...');
        const inventory = await Inventory.find();
        console.log(`Found ${inventory.length} inventory items`);
        
        // Calculate total cost
        const totalCost = groceries.reduce((sum, item) => {
            const itemCost = (item.price || 0) * (item.quantity || 0);
            return sum + itemCost;
        }, 0);
        console.log(`Total cost calculated: ${totalCost}`);

        // Group by category
        const categoryGroups = groceries.reduce((groups, item) => {
            const category = item.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});
        console.log('Categories grouped:', Object.keys(categoryGroups));

        // Analyze inventory needs
        console.log('Analyzing inventory needs...');
        const inventoryNeeds = inventory.reduce((needs, item) => {
            try {
                // Check if item is low in stock (less than 20% of typical quantity)
                const typicalQuantity = item.typicalQuantity || item.quantity || 0;
                const currentQuantity = item.quantity || 0;
                const isLowStock = currentQuantity < (typicalQuantity * 0.2);
                
                // Check if item is expiring soon (within 7 days)
                const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
                const today = new Date();
                const isExpiringSoon = expiryDate && (expiryDate - today) < (7 * 24 * 60 * 60 * 1000);

                if (isLowStock || isExpiringSoon) {
                    const category = item.category || 'Uncategorized';
                    if (!needs[category]) {
                        needs[category] = [];
                    }
                    needs[category].push({
                        name: item.name,
                        currentQuantity: currentQuantity,
                        unit: item.unit,
                        typicalQuantity: typicalQuantity,
                        needsRestock: isLowStock,
                        expiringSoon: isExpiringSoon,
                        expiryDate: item.expiryDate
                    });
                }
                return needs;
            } catch (error) {
                console.error('Error processing inventory item:', item, error);
                return needs;
            }
        }, {});
        console.log('Inventory needs analyzed:', Object.keys(inventoryNeeds));

        const report = {
            totalItems: groceries.length,
            totalCost: totalCost,
            categories: Object.entries(categoryGroups).map(([category, items]) => ({
                category,
                itemCount: items.length,
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity || 0,
                    unit: item.unit,
                    price: item.price || 0,
                    storeName: item.storeName
                }))
            })),
            inventoryNeeds: Object.entries(inventoryNeeds).map(([category, items]) => ({
                category,
                itemCount: items.length,
                items: items.map(item => ({
                    name: item.name,
                    currentQuantity: item.currentQuantity,
                    typicalQuantity: item.typicalQuantity,
                    unit: item.unit,
                    needsRestock: item.needsRestock,
                    expiringSoon: item.expiringSoon,
                    expiryDate: item.expiryDate
                }))
            }))
        };

        console.log('Report generated successfully');
        res.status(200).json(report);
    } catch (error) {
        console.error('Error in generateReport:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: "Error generating report", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
