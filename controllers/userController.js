const User = require("../models/Users");
const Recipe = require("../models/Recipe");
const Follow = require('../models/Follow')
const jwt = require('jsonwebtoken')

exports.apiGetRecipesByUsername = async function(req , res){
  try{
    let authorDoc = await User.findByUsername(req.params.username)
    let recipes = await Recipe.findByAuthorId(authorDoc._id)
    res.json(recipes)
  }catch{
    res.json("Sorry, invalid user requested.")
  }
}


exports.doesUsernameExist = function(req, res){
  User.findByUsername(req.body.username).then(function(){
    res.json(true)
  }).catch(function(){
    res.json(false)
  })
}


exports.doesEmailExist = async function(req, res) {
  let emailBool = await User.doesEmailExist(req.body.email)
  res.json(emailBool)
}

exports.sharedProfileData = async function(req, res, next){
  let isVisitorsProfile = false
  let isFollowing = false
  if(req.session.user){
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
    isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
  }

  req.isVisitorsProfile = isVisitorsProfile
  req.isFollowing = isFollowing
  // retrieve recipes, follower, and following counts
  let recipeCountPromise = Recipe.countRecipesByAuthor(req.profileUser._id)
  let followerCountPromise = Follow.countFollowersById(req.profileUser._id)
  let followingCountPromise = Follow.countFollowingById(req.profileUser._id)

  let [recipeCount, followerCount, followingCount] = await Promise.all([recipeCountPromise, followerCountPromise, followingCountPromise])
  
  req.recipeCount =recipeCount
  req.followerCount = followerCount
  req.followingCount = followingCount
  
  next()
}



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

exports.apiMustBeLoggedIn = function(req, res, next){
  try{
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET)
    next()
  }catch{
    res.json("Sorry, you must provide a valid token.")
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


exports.apiLogin = function(req, res) {
  let user = new User(req.body)
  user.login().then(function(result) {
    res.json(jwt.sign({_id: user.data._id}, process.env.JWTSECRET, {expiresIn: '7d'}))
  }).catch(function(error) {
    res.json("Sorry, your values are not correct.")
  })
}




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


exports.home = async function (req, res) {
  if (req.session.user) {
    // fetch feed of recipes for current user
    let recipes = await Recipe.getFeed(req.session.user._id)
    res.render("home-dashboard", {recipes: recipes});
  } else {
    res.render("guest-home", {regErrors: req.flash('regErrors')});
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
      title: `Profile for ${req.profileUser.username}`,
      currentPage: "recipes",
      recipes: recipes,
      profileUsername: req.profileUser.username,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {recipeCount: req.recipeCount, followerCount: req.followerCount, followingCount: req.followingCount}
    })
  }).catch(function(){
    res.render("404")
  })
  
}


exports.profileFollowersScreen = async function(req, res){
  try{
    let followers = await Follow.getFollowersById(req.profileUser._id)
    res.render("profile-followers", {
      currentPage: "followers",
      followers: followers,
      profileUsername: req.profileUser.username,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {recipeCount: req.recipeCount, followerCount: req.followerCount, followingCount: req.followingCount}

    })
  }catch(e){
    res.render("404")
  }
}


exports.profileFollowingScreen = async function(req, res){
  try{
    let following = await Follow.getFollowingById(req.profileUser._id)
    res.render("profile-following", {
      currentPage: "following",
      following: following,
      profileUsername: req.profileUser.username,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {recipeCount: req.recipeCount, followerCount: req.followerCount, followingCount: req.followingCount}

    })
  }catch(e){
    res.render("404")
  }
}

