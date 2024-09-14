require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require("passport");
const PrismaSessionStore = require('@quixo3/prisma-session-store').PrismaSessionStore;
const { PrismaClient } = require('@prisma/client');
const flash = require('connect-flash')
const fileRouters = require('./routes/fileRouters');
const path = require('path');

const app = express();
const prisma = new PrismaClient();

const initializePassport = require("./passport-config");
initializePassport(passport);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up session
app.use(
  session({
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

// Middleware to make flash messages available in all templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // This is typically for Passport.js errors
  next();
});


// Routes
app.use(fileRouters);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
