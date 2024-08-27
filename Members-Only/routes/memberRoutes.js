const express = require('express');
const router = express.Router();
const controller = require('../controllers/memberControllers');

// Home page route
router.get('/', controller.homePage);

// Sign-up routes
router.get('/sign-up', controller.signUpPageGet);
router.post('/sign-up', controller.signUpPost);

// Log-in routes
router.get('/log-in', controller.logInPageGet);
router.post('/log-in', controller.logInPost);

// Create post routes (protected)
router.get('/create-post', controller.ensureAuthenticated, controller.createPostGet);
router.post('/create-post', controller.ensureAuthenticated, controller.createPost);

// View posts page (protected)
router.get('/posts', controller.ensureAuthenticated, controller.showPostsPage);

// Become member routes (protected)
router.get('/become-member', controller.ensureAuthenticated, controller.becomeMemberPageGet);
router.post('/become-member', controller.ensureAuthenticated, controller.becomeMemberPost);

// Become admin route
router.get('/become-admin', controller.ensureAuthenticated, controller.adminGet);
router.post('/become-admin', controller.ensureAuthenticated, controller.becomeAdminPost);

// Delete post route
router.post('/posts/:id/delete', controller.ensureAuthenticated, controller.deletePost);


module.exports = router;
