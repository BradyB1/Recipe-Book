const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const recipeController = require("./controllers/recipeController");
const followController = require("./controllers/followController");

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
router.post("/doesUsernameExist", userController.doesUsernameExist)
router.post("/doesEmailExist", userController.doesEmailExist)

// PROFILE RELATED ROUTES
router.get("/profile/:username", userController.ifUserExists, userController.sharedProfileData, userController.profileRecipesScreen)
router.get("/profile/:username/followers", userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen)
router.get("/profile/:username/following", userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen)



// RECIPE RELATED ROUTES
    // All recipes under user account
router.get("/recipes", recipeController.viewRecipeScreen);

//POST RELATED ROUTES
    // active create-recipe screen
router.get("/create-recipe", userController.mustBeLoggedIn, recipeController.viewCreateRecipeScreen);
router.post("/create-recipe", userController.mustBeLoggedIn, recipeController.create)
router.get("/recipe/:id", recipeController.viewSingle)
router.get("/recipe/:id/edit", userController.mustBeLoggedIn, recipeController.viewEditScreen)
router.post("/recipe/:id/edit", userController.mustBeLoggedIn, recipeController.edit)
router.post("/recipe/:id/delete", userController.mustBeLoggedIn, recipeController.delete)
router.post("/search", recipeController.search)


// FOLLOW RELATED ROUTES
router.post("/addFollow/:username", userController.mustBeLoggedIn, followController.addFollow)
router.post("/removeFollow/:username", userController.mustBeLoggedIn, followController.removeFollow)

module.exports = router;
