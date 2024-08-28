if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
const express = require("express");
const bodyParser = require("body-parser");
const memberRoutes = require("./routes/memberRoutes");
const path = require("path");
const app = express();
const passport = require("passport");
const flash  = require('express-flash')
const session  = require('express-session')
const models = require('./models/queries')


const initializePassport = require("./passport-config");
initializePassport(
  passport,
  models.getUserByUsername,
  models.getUserById
);


// Middleware
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", memberRoutes);

// Start server
const PORT = process.env.PORT || 8020;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
