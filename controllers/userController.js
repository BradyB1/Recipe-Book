const User = require("../models/Users");

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { favColor: "blue", username: user.data.username };
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
};

exports.logout = function (req, res) {};

exports.register = function (req, res) {
  let user = new User(req.body);
  user.register();
  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("congrats");
  }
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("guest-home");
  }
  // res.render("home");
};
