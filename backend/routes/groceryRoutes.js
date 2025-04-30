const express = require("express");
const router = express.Router();
const GroceryListController = require("../controllers/GroceryListController");
const { protect } = require("../middleware/authMiddleware");

// Define routes
router.get("/", GroceryListController.getAllGroceries);
router.get("/report", protect, GroceryListController.generateReport);
router.post("/", protect, GroceryListController.createGrocery);
router.get("/:id", GroceryListController.getGroceryById);
router.put("/:id", protect, GroceryListController.updateGrocery);
router.delete("/:id", protect, GroceryListController.deleteGrocery);

module.exports = router;
