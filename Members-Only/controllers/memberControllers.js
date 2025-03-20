const bcrypt = require("bcryptjs");
const models = require("../models/queries");
const passport = require("passport");
const { body, validationResult } = require("express-validator")


// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/log-in');
}

async function homePage(req, res) {
  res.render("home");
}

async function signUpPageGet(req, res) {
  res.render("signUp");
}

async function signUpPost(req, res, next) {
   // Add validation and sanitization
   await body('firstname').trim().escape().notEmpty().withMessage('First name is required').run(req);
   await body('lastname').trim().escape().notEmpty().withMessage('Last name is required').run(req);
   await body('username').trim().escape().notEmpty().withMessage('User name is required').run(req);
   await body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').run(req);
   await body('confirmPassword').trim().isLength({ min: 8 }).withMessage('Confirm Password must be at least 8 characters long').run(req);
 
   // Check for validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.render("signUp", { errors: errors.array() });
   }


  const { firstname, lastname, username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("signUp", { errors: [{ msg: "Passwords do not match!" }] });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await models.signUpInfo(firstname, lastname, username, hashedPassword, false);
    res.redirect("/log-in");
  } catch (err) {
    return next(err);
  }
}

async function logInPageGet(req, res) {
  res.render("logIn", { messages: req.flash('error') });
}

async function logInPost(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/posts',
    failureRedirect: '/log-in',
    failureFlash: true
  })(req, res, next);
}

async function createPostGet(req, res) {
  res.render('create-post', { user: req.user });
}

async function createPost(req, res) {
  // Add validation and sanitization
  await body('content').trim().escape().notEmpty().withMessage('Content is required').run(req);

  // Check for validation errors
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.render("create-post", { errors: errors.array() });
   }
 


  const {username, content } = req.body;

  try {
    // Always save the actual username in the database
    await models.postInfo(username, content);
    res.redirect('/posts');
  } catch (err) {
    console.error("Error saving post:", err);
    res.status(500).send("An error occurred while saving the post.");
  }
}

async function showPostsPage(req, res) {
  try {
    const posts = await models.getAllPosts(); // Fetch all posts from the database
    const userIsMember = req.user && req.user.ismember; // Check if the user is a member
    const userIsAdmin = req.user && req.user.isadmin;

    
    res.render('posts', {
      user: req.user,
      posts: posts,
      userIsMember: userIsMember, // Pass membership status to the template
      userIsAdmin: userIsAdmin
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("An error occurred while fetching posts.");
  }
}


async function becomeMemberPageGet(req, res) {
  res.render('become-member');
}

async function becomeMemberPost(req, res) {
   // Add validation and sanitization
   await body('secretKeymember').trim().escape().notEmpty().withMessage('Secret key is required').run(req);

   // Check for validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.render("become-member", { errors: errors.array() });
   }


  const { secretKeymember } = req.body;

  if (secretKeymember === process.env.MEMBER_KEY) {
    try {
      await models.updateMembershipStatus(req.user.username, true);
      res.redirect('/posts');
    } catch (err) {
      console.error("Error updating membership status:", err);
      res.status(500).send("An error occurred while updating your membership status.");
    }
  } else {
    res.status(401).send("Invalid secret key. Please try again.");
  }
}

async function adminGet(req, res) {
  res.render("become-admin");
}

async function becomeAdminPost(req, res) {
   // Add validation and sanitization
   await body('secretKeyadmin').trim().escape().notEmpty().withMessage('Admin key is required').run(req);

   // Check for validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.render("become-admin", { errors: errors.array() });
   }

  const { secretKeyadmin } = req.body;

  if (secretKeyadmin === process.env.SECRET_KEY_ADMIN) {
    try {
      await models.updateAdminStatus(req.user.username, true);
      res.redirect('/posts');
    } catch (err) {
      console.error("Error updating admin status:", err);
      res.status(500).send("An error occurred while updating your admin status.");
    }
  } else {
    res.status(401).send("Invalid admin key. Please try again.");
  }
}

async function deletePost(req, res) {
  const { id: postId } = req.params;  // Correctly destructure postId from req.params

  if (!req.user || !req.user.isadmin) {
    return res.status(403).send("You do not have permission to delete this post.");
  }

  try {
    await models.deletePostById(postId);  // Call the delete function with the correct postId
    res.redirect('/posts');  // Redirect to the posts page after deletion
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("An error occurred while deleting the post.");
  }
}




module.exports = {
  ensureAuthenticated,
  homePage,
  signUpPageGet,
  signUpPost,
  logInPageGet,
  logInPost,
  createPostGet,
  createPost,
  showPostsPage,
  becomeMemberPageGet,
  becomeMemberPost,
  adminGet,
  becomeAdminPost,
  deletePost
};
