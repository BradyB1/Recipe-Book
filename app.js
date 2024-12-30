// const http = require("http");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash")
const markdown = require("marked")


const app = express();
let sessionOptions = session({
  secret: "nonguessable secret token",
  store: MongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: "strict" },
});

app.use(sessionOptions);
app.use(flash())

app.use(function(req, res, next){
  // make markdown function available from within ejs templates
  res.locals.filterUserHTML = function(content){
    return markdown.parse(content)
  }

  // make all error and success falsh messages available from all templates
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")
  // Make current user id available on the req object 
  if (req.session.user) {
    req.visitorId = req.session.user._id
  } else {
    req.visitorId = 0
  }

  // make user session data available from within view templates
  res.locals.user = req.session.user
  next()
})

const router = require("./router");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
