const apiRouter = require("express").Router()
const userController = require("./controllers/userController");
const recipeController = require("./controllers/recipeController");
const followController = require("./controllers/followController");
const cors = require("cors")

apiRouter.use(cors())

apiRouter.post("/login", userController.apiLogin)
apiRouter.post("/create-recipe", userController.apiMustBeLoggedIn, recipeController.apiCreate)
apiRouter.delete("/recipe/:id", userController.apiMustBeLoggedIn, recipeController.apiDelete)
apiRouter.get("/recipesByAuthor/:username", userController.apiGetRecipesByUsername)
module.exports = apiRouter