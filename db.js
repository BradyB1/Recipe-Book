// const dotenv = require("dotenv");
// dotenv.config();

const { MongoClient } = require("mongodb");

const client = new MongoClient('mongodb+srv://bbuttrey:Brady19940@cluster0.lw3yw.mongodb.net/OurRecipes?retryWrites=true&w=majority&appName=Cluster0');

async function start() {
  await client.connect("");
  module.exports = client;
  const app = require("./app");
  app.listen(5000);
}

start();
