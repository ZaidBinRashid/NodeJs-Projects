const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controller');

// User Routes (Authentication)
router.post('/api/signup', controllers.signUpValidation, controllers.signUpPost);
router.post('/api/login', controllers.logInPost);

// Blog Routes
router.get('/api/posts', controllers.getAllPosts); // Get all blog posts
// router.get('/api/posts/:id', controllers.getSinglePost); // Get a single post by id
router.post('/api/posts',controllers.authenticate, controllers.createPost); // Create a new post (Admin only)
// router.put('/api/posts/:id', controllers.updatePost); // Update a post (Admin only)
router.delete('/api/posts/:id', controllers.authenticate, controllers.deletePost); // Delete a post (Admin only)

// // Comment Routes
// router.post('/api/posts/:id/comments', controllers.addComment); // Add a comment to a post
// router.get('/api/posts/:id/comments', controllers.getComments); // Get comments for a post

module.exports = router;
