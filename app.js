// const http = require("http");
const express = require("express");
const router = require("./router");

const app = express();
app.listen(3000);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("views", "views");
app.set("view engine", "ejs");
app.use("/", router);

module.exports = app;
