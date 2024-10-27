require("dotenv").config();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Validation and sanitization middleware for sign-up
const signUpValidation = [
  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 4 })
    .withMessage("First name must be at least 2 characters long"),

  body("lastname")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 4 })
    .withMessage("Last name must be at least 2 characters long"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];


// RESTful sign-up endpoint
async function signUpPost(req, res) {
  try {
    // Run validation and sanitization
    await Promise.all(
      signUpValidation.map((validation) => validation.run(req))
    );
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Return JSON with validation errors
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { firstname, lastname, email, password } = req.body;

    // Check if the user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email belongs to you (the admin)
    let role = "USER"; // Default role is 'USER'
    const adminEmail = process.env.ADMIN_EMAIL;

    if (email === adminEmail) {
      role = "ADMIN"; // Assign admin role to your specific email
    }

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username: `${firstname} ${lastname}`,
        email,
        passwordHash: hashedPassword,
        role: role,
      },
    });

    // Generate a JWT token for the user
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "shhhh",
      { expiresIn: "2h" }
    );

    // Return the created user and token in JSON format
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error in signUpPost:", error);
    return res
      .status(500)
      .json({ success: false, error: "Something went wrong" });
  }
}

// RESTful log-in endpoint
async function logInPost(req, res) {
  try {
    // Get email and password from the request body
    const { email, password } = req.body;

    // Validate if both email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password" });
    }

    // Match the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password" });
    }

    // Generate a JWT token if the login is successful
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "shhhh",
      { expiresIn: "2h" }
    );

    // Return user data and token in JSON format
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
}

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Assuming the token is sent in the Authorization header
   
  if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      req.user = decoded; // Set the decoded token to req.user
      next(); // Proceed to the next middleware or route handler
  });
};

async function createPost(req, res) {
  try {
      // Extract authorId from the token or session
      const authorId = req.user.id; // Assuming you've added user info to the request object after authentication
    
      // Destructure the data from the request body
      const { title, content, status, imageUrl } = req.body;

      // Validate input data
      if (!(title || content || status || imageUrl)) {
          return res.status(400).json({ success: false, error: "All fields are required" });
      }

      // Validate image URL (optional)
      if (imageUrl && !isValidUrl(imageUrl)) {
          return res.status(400).json({ success: false, error: "Invalid image URL" });
      }

      // Create a new blog post in the database
      const newPost = await prisma.blogPost.create({
          data: {
              title,
              content,
              author: { connect: { id: authorId } }, // Use the authorId from the authenticated user
              status,
              imageUrl // Save the image URL in the database
          },
      });

      // Return a success response
      return res.status(201).json({ success: true, post: newPost });
  } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

// Helper function to validate the image URL
function isValidUrl(url) {
  try {
      new URL(url); // URL constructor throws if the URL is invalid
      return true;
  } catch (_) {
      return false;
  }
}


async function getAllPosts(req, res) {
  try {
      // Fetch all blog posts from the database, including the author details
      const posts = await prisma.blogPost.findMany({
          include: {
              author: true, // Include the author details (name, etc.)
          },
          orderBy: {
              createdAt: 'desc', // Optional: order posts by the newest first
          },
      });

      // Return the posts in the response
      return res.status(200).json({ success: true, posts });
  } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

async function deletePost(req, res) {
  try {
      const postId = parseInt(req.params.id);
      
      // Make sure the postId is valid
      if (isNaN(postId)) {
          return res.status(400).json({ success: false, error: "Invalid post ID" });
      }

      // Find the post and check if it exists
      const post = await prisma.blogPost.findUnique({
          where: { id: postId }
      });

      if (!post) {
          return res.status(404).json({ success: false, error: "Post not found" });
      }

      // Optionally check if the user is authorized to delete the post (e.g., only the author can delete)
      const userId = req.user.id; // Assuming you have the user info in the request after authentication
      if (post.authorId !== userId) {
          return res.status(403).json({ success: false, error: "Not authorized to delete this post" });
      }

      // Delete the post
      await prisma.blogPost.delete({
          where: { id: postId }
      });

      return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}





// Export all controllers
module.exports = {
  signUpValidation,
  authenticate,
  signUpPost,
  logInPost,
  createPost,
  getAllPosts,
  deletePost,
};
