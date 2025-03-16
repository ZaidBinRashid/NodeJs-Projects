const { log } = require("console");
const express = require("express");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const messageRoute = require('./routes/message')
app.use('/', messageRoute)

app.use(express.static(path.join(__dirname, "public")));

app.listen(2000, () => {
  console.log("Server started at port 2000");
});
