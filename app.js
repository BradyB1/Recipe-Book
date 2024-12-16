// const http = require("http");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const router = require("./router");

const app = express();
let sessionOptions = session({
  secret: "nonguessable secret token",
  store: MongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: "strict" },
});

app.use(sessionOptions);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
