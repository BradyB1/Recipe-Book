const User = require("../models/Users");
const Recipe = require("../models/Recipe");

exports.mustBeLoggedIn = function(req, res, next){
  if(req.session.user){
    next()
  }else{
    req.flash("errors", "You must be logged into to perform this action.")
    req.session.save(function(){
      res.redirect('/')
    })
  }
}


exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { favColor: "blue", username: user.data.username, _id: user.data._id };
      req.session.save(function(){
        res.redirect("/")
      })

    })
    .catch(function (error) {
      req.flash("errors", error)
      req.session.save(function(){
        res.redirect('/');
      })
      
    });
};

exports.logout = function (req, res) {
  req.session.destroy(function(){
    res.redirect('/')
  });
  
};


exports.register = function (req, res) {
  let user = new User(req.body);
  user.register().then(()=> {
    req.session.user = {username: user.data.username, _id: user.data._id}
    req.session.save(function(){
      res.redirect('/')
  })
  }).catch((regErrors) => {
    regErrors.forEach(function(error){
      req.flash('regErrors', error)
      })
      req.session.save(function(){
        res.redirect('/')
    })
  })
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard");
  } else {
    res.render("guest-home", {errors: req.flash('errors'), regErrors: req.flash('regErrors')});
  }
  // res.render("home");
};


exports.ifUserExists = function(req, res, next){
  User.findByUsername(req.params.username).then(function(userDocument){
    req.profileUser = userDocument
    next()
  }).catch(function(){
    res.render("404")
  })
}

exports.profileRecipesScreen = function(req, res){
  // ask our posts model for posts by certain id
  Recipe.findByAuthorId(req.profileUser._id).then(function(recipes){
    res.render("profile", {
      recipes: recipes,
      profileUsername: req.profileUser.username
    })
  }).catch(function(){
    res.render("404")
  })
  
}