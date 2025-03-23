const express = require("express");
const router = express.Router();
const GroceryListController = require("../controllers/GroceryListController");

// Define routes
router.get("/", GroceryListController.getAllGroceries);
router.get("/:id", GroceryListController.getGroceryById);
router.post("/", GroceryListController.createGrocery);
router.put("/:id", GroceryListController.updateGrocery);
router.delete("/:id", GroceryListController.deleteGrocery);

module.exports = router;
