exports.home = function (req, res) {
  res.render("home");
};

exports.login = function (req, res) {
  res.render("guest-home");
};

exports.logout = function (req, res) {};
