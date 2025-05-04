const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/InventoryController");
const { protect, authorize } = require("../middleware/authMiddleware");
const auth = require("../middleware/auth")

// Create a separate router for the report endpoint
const reportRouter = express.Router();
reportRouter.get("/", protect, authorize('inventory_manager'), InventoryController.generateReport);

// Mount the report router
router.use("/report", reportRouter);

// Define other routes
router.get("/", auth, InventoryController.getAllInventory);
router.get("/report", auth, InventoryController.generateReport);
router.post("/", auth, authorize('inventory_manager'), InventoryController.createInventory);
router.get("/:id", auth, InventoryController.getInventoryById);
router.put("/:id", auth, authorize('inventory_manager'), InventoryController.updateInventory);
router.delete("/:id", auth, authorize('inventory_manager'), InventoryController.deleteInventory);

module.exports = router; 