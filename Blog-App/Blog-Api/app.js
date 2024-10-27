require('dotenv').config();
const express = require('express');
const path = require('path');
const Routers = require('./routes/routers');
const helmet = require('helmet'); // For security
const cookieParser = require('cookie-parser');
const cors = require('cors');


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Replaces body-parser
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(helmet()); // Adds security headers
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.options('/api/login', cors());
app.options('/api/signup', cors());



// Routes
app.use(Routers);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
