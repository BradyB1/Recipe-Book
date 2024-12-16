const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const recipeController = require("./controllers/recipeController");

//  Not logged in Home Page
router.get("/", userController.home);

//Logged in Home Page
router.get("/home", userController.home);

// All recipes under user account
router.get("/recipes", recipeController.viewRecipeScreen);

// active create-recipe screen
router.get("/create-recipe", recipeController.viewCreateRecipeScreen);

// sends a post request to login
router.post("/login", userController.login);
// sends a post request to register as a user in the Mongodb
router.post("/register", userController.register);

module.exports = router;
