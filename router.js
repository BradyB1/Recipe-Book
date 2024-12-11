const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const recipeController = require("./controllers/recipeController");

//  Not logged in Home Page
router.get("/", userController.login);

//Logged in Home Page
router.get("/home", userController.home);

// All recipes under user account
router.get("/recipes", recipeController.viewRecipeScreen);

module.exports = router;
