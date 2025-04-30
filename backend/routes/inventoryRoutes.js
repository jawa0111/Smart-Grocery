const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/InventoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Create a separate router for the report endpoint
const reportRouter = express.Router();
reportRouter.get("/", protect, authorize('inventory_manager'), InventoryController.generateReport);

// Mount the report router
router.use("/report", reportRouter);

// Define other routes
router.get("/", protect, InventoryController.getAllInventory);
router.post("/", protect, authorize('inventory_manager'), InventoryController.createInventory);
router.get("/:id", protect, InventoryController.getInventoryById);
router.put("/:id", protect, authorize('inventory_manager'), InventoryController.updateInventory);
router.delete("/:id", protect, authorize('inventory_manager'), InventoryController.deleteInventory);

module.exports = router; 