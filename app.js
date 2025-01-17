// const http = require("http");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash")
const markdown = require("marked")
const sanitizeHTML = require("sanitize-html")
const app = express();

const csrf = require("csurf")


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api", require("./router-api"))


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



app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

// might get rid of csrf 
app.use(csrf())

app.use(function(req, res, next){
  res.locals.csrfToken = req.csrfToken()
  next()
})
// might get rid of csrf 
app.use("/", router);

app.use(function(err, req, res, next){
  if(err){
    if(err.code == "EBADCSRFTOKEN"){
      req.flash("errors", "Cross site request forgery detected")
      req.session.save(()=> res.redirect('/'))
    }else{
      res.render("404")
    }
  }

})

const server = require("http").createServer(app)
const io = require("socket.io")(server)

io.use(function (socket, next) {
  sessionOptions(socket.request, socket.request.res || {}, next)
})

io.on("connection", function(socket){
  if(socket.request.session.user){
    let user = socket.request.session.user

    // add "avatar: user.avatar" when we integrate user profile pictures
    socket.emit("welcome", {username: user.username})

    socket.on('chatMessageFromBrowser', function(data){
      // add "avatar: user.avatar" when we integrate user profile pictures
      socket.broadcast.emit("chatMessageFromServer", {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username})
    })
  }

})

module.exports = server;
