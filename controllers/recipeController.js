const Recipe = require("../models/Recipe")

exports.viewRecipeScreen = function (req, res) {
  res.render("recipes");
};

exports.viewCreateRecipeScreen = function(req, res){
  res.render("create-recipe")
}

exports.create = function(req, res){
  let recipe = new Recipe(req.body, req.session.user._id)
  recipe.create().then(function(newId){
    req.flash("success", "New recipe successfully created.")
    req.session.save(()=>{
      res.redirect(`recipe/${newId}`)
    })
  }).catch(function(errors){
    errors.forEach(error => req.flash("errors", error))
    req.session.save(() => res.redirect("/create-recipe"))
  })
}


exports.viewSingle = async function(req, res){
  try{
    let recipe = await Recipe.findSingleById(req.params.id, req.visitorId)
    res.render('single-recipe-screen', {recipe: recipe})
  } catch{
    res.render("404")
  }

}

// exports.viewEditScreen = async function(req, res){
//   try{
//     let recipe = await Recipe.findSingleById(req.params.id)
//     if (recipe.authorId == req.visitorId){
//       res.render("edit-recipe", {recipe:recipe})  

//     }else{
//       res.flash("errors", "You do not have permission to perform that action")
//       req.session.save(()=> res.redirect('/'))

      
//     }
//   }catch{
//     res.render("404")
//   }
// }

exports.viewEditScreen = async function(req, res){
  try{
    let recipe = await Recipe.findSingleById(req.params.id, req.visitorId)
    if (recipe.isVisitorOwner){
      res.render("edit-recipe", {recipe:recipe})  

    }else{
      res.flash("errors", "You do not have permission to perform that action")
      req.session.save(()=> res.redirect('/'))

      
    }
  }catch{
    res.render("404")
  }
}


exports.edit = function(req,res){
  // might need to add each recipe attribute here in place of req.body -- so req.title, req.description, req.ingredients, req.steps, req.cook_time
  let recipe = new Recipe(req.body, req.visitorId, req.params.id)
  recipe.update().then((status) =>{
    // the post was successfully updated in the database 
    // or user did have perms but there were validation errors
    if (status == "success"){
      //post was updated in db
      req.flash("success", "Post Sucessfully Updated.")
      req.session.save(function(){
        res.redirect(`/recipe/${req.params.id}/edit`)
      })
    }else{
      post.errors.forEach(function(Error){
        req.flash("errors", error)
      })
      req.session.save(function(){
        res.redirect`/recipe/${req.params.id}/edit`
      })
    }

  }).catch(()=>{
    // a post with the requested id doesn't exist
    // or if the current visitor is no the owner of the requested post
    req.flash("errors", "You do not have permissions to perform that action.")
    req.session.save(function(){
      res.redirect('/')
    })
  })
}


exports.delete = function(req, res){
  Recipe.delete(req.params.id, req.visitorId).then(()=>{
    req.flash("success", "Recipe Successfully Deleted.")
    req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
    console.log("the the then of delete. should be good here")
  }).catch(()=>{
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(()=> res.redirect('/'))
    console.log("the the catch of delete. No Bueno")
  })
}


exports.search = function(req, res){
  Recipe.search(req.body.searchTerm).then( recipes =>{
    res.json(recipes)
  }).catch(() =>{
    res.json([])
  })
}