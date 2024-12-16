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

// 
router.get("/create-recipe", recipeController.viewCreateRecipeScreen)


router.post("/login", userController.login)
router.post("/register", userController.register)
router.post("/login", userController.login)
module.exports = router;
