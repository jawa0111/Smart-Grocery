const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/InventoryController");

// Define routes
router.get("/", InventoryController.getAllInventory);
router.get("/:id", InventoryController.getInventoryById);
router.post("/", InventoryController.createInventory);
router.put("/:id", InventoryController.updateInventory);
router.delete("/:id", InventoryController.deleteInventory);

module.exports = router; 