const Recipe = require("../models/Recipe")

exports.viewRecipeScreen = function (req, res) {
  res.render("recipes");
};

exports.viewCreateRecipeScreen = function(req, res){
  res.render("create-recipe")
}

exports.create = function(req, res){
  let recipe = new Recipe(req.body, req.session.user._id)
  recipe.create().then(function(){
    res.send("New recipe Created")
  }).catch(function(errors){
    res.send(errors)
  })
}


exports.viewSingle = async function(req, res){
  try{
    let recipe = await Recipe.findSingleById(req.params.id)
    res.render('single-recipe-screen', {recipe: recipe})
  } catch{
    res.render("404")
  }

}