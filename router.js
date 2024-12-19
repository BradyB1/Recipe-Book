const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const recipeController = require("./controllers/recipeController");

// USER RELATED ROUTES //

//  Not logged in Home Page
router.get("/", userController.home);
//Logged in Home Page
router.get("/home", userController.home);
// sends a post request to login
router.post("/login", userController.login);
// sends a post request to register as a user in the Mongodb
router.post("/register", userController.register);
// sends a post request to logout a user -- destroy session
router.post("/logout", userController.logout);

// PROFILE RELATED ROUTES
router.get("/profile/:username", userController.ifUserExists, userController.profileRecipesScreen)




// RECIPE RELATED ROUTES
// All recipes under user account
router.get("/recipes", recipeController.viewRecipeScreen);

// active create-recipe screen
router.get("/create-recipe", userController.mustBeLoggedIn, recipeController.viewCreateRecipeScreen);
router.post("/create-recipe", userController.mustBeLoggedIn, recipeController.create)
router.get("/recipe/:id", recipeController.viewSingle)

module.exports = router;
