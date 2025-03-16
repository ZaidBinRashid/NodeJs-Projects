require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const tvShowsRouter = require('./routes/tvshowRouters');
const path = require('path');
const app = express();


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', tvShowsRouter);

// Start server
const PORT = process.env.PORT || 3050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
