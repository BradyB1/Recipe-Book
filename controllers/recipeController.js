exports.viewRecipeScreen = function (req, res) {
  res.render("recipes");
};

exports.viewCreateRecipeScreen = function(req, res){
  res.render("create-recipe")
}