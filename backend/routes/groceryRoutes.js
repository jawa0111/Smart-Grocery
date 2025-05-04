const express = require("express");
const router = express.Router();
const GroceryListController = require("../controllers/GroceryListController");
const { protect } = require("../middleware/authMiddleware");
const auth = require("../middleware/auth")

// Define routes
router.get("/", auth, GroceryListController.getAllGroceries);
router.get("/report", auth, GroceryListController.generateReport);
router.post("/", auth, GroceryListController.createGrocery);
router.get("/:id", auth, GroceryListController.getGroceryById);
router.put("/:id", auth, GroceryListController.updateGrocery);
router.delete("/:id", auth, GroceryListController.deleteGrocery);

module.exports = router;
