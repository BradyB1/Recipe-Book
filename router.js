const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const recipeController = require("./controllers/recipeController");

router.get("/", userController.home);

// Home Page
router.get("/recipes", recipeController.viewRecipeScreen);

module.exports = router;
