const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const passport = require("passport");

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
  const { firstname, lastname, username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send("Passwords do not match!");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.signUpInfo(firstname, lastname, username, hashedPassword, false);
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
  const {username, content } = req.body;

  try {
    // Always save the actual username in the database
    await db.postInfo(username, content);
    res.redirect('/posts');
  } catch (err) {
    console.error("Error saving post:", err);
    res.status(500).send("An error occurred while saving the post.");
  }
}

async function showPostsPage(req, res) {
  try {
    const posts = await db.getAllPosts(); // Fetch all posts from the database
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

const SECRET_KEY = 'vibgyor';

async function becomeMemberPost(req, res) {
  const { secretKeymember } = req.body;

  if (secretKeymember === SECRET_KEY) {
    try {
      await db.updateMembershipStatus(req.user.username, true);
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


const SECRET_KEY_ADMIN = 'nikola'; 

async function becomeAdminPost(req, res) {
  const { secretKeyadmin } = req.body;

  if (secretKeyadmin === SECRET_KEY_ADMIN) {
    try {
      await db.updateAdminStatus(req.user.username, true);
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
    await db.deletePostById(postId);  // Call the delete function with the correct postId
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
