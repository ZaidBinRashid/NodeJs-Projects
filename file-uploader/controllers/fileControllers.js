const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/log-in');
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save files in 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Use the original filename
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


/**
 * Render the home page.
 */
async function homeGet(req, res) {
  res.render("home");
}

/**
 * Render the sign-up page.
 */
async function signUpGet(req, res) {
  res.render("signUp");
}

/**
 * Render the login page.
 */
async function logInGet(req, res) {
  res.render("logIn");
}

/**
 * Handle sign-up form submission.
 */
async function signInPost(req, res, next) {
  // Validate and sanitize form inputs
  await body("firstname").trim().escape().notEmpty().withMessage("First name is required").run(req);
  await body("lastname").trim().escape().notEmpty().withMessage("Last name is required").run(req);
  await body("username").trim().escape().notEmpty().withMessage("User name is required").run(req);
  await body("password").trim().isLength({ min: 8 }).withMessage("Password must be at least 8 characters long").run(req);
  await body("confirmPassword").trim().isLength({ min: 8 }).withMessage("Confirm Password must be at least 8 characters long").run(req);

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
    await prisma.user.create({
      data: { firstname, lastname, username, password: hashedPassword },
    });

    res.redirect("/log-in");
  } catch (err) {
    next(err);
  }
}

/**
 * Handle login form submission.
 */
async function logInPost(req, res, next) {
  try {
    passport.authenticate('local', {
      successRedirect: '/filesPage',
      failureRedirect: '/log-in',
      failureFlash: true
    })(req, res, next);
  } catch (err) {
    next(err);
  }
}

/**
 * Get and render all folders and files for the authenticated user.
 */
async function filesGet(req, res) {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
    });

    res.render("filesPage", {
      user: req.user,
      folders: folders,
      msg: req.flash("msg"),
      errors: req.flash("errors") || [],
    });
  } catch (err) {
    req.flash("errors", [{ msg: "Error loading files" }]);
    res.redirect("/");
  }
}

/**
 * Get all folders for the authenticated user.
 */
async function getFolders(req, res) {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
    });

    res.render("filesPage", {
      user: req.user,
      folders,
      msg: req.flash("msg"),
      errors: req.flash("errors"),
    });
  } catch (err) {
    req.flash("errors", [{ msg: "Error loading folders" }]);
    res.redirect("/");
  }
}

/**
 * Create a new folder for the authenticated user.
 */
async function createFolder(req, res) {
  try {
    const { folderName } = req.body;

    await prisma.folder.create({
      data: {
        name: folderName,
        userId: req.user.id,
      },
    });

    req.flash("msg", "Folder created successfully!");
    res.redirect("/folders");
  } catch (err) {
    req.flash("errors", [{ msg: "Failed to create folder" }]);
    res.redirect("/folders");
  }
}


/**
 * Update an existing folder.
 */
async function updateFolder(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await prisma.folder.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.redirect('/folders');
  } catch (err) {
    req.flash("errors", [{ msg: "Failed to update folder" }]);
    res.redirect("/folders");
  }
}

/**
 * Delete a folder.
 */
async function deleteFolder(req, res) {
  try {
    const { id } = req.params;

    await prisma.folder.delete({
      where: { id: parseInt(id) },
    });

    req.flash("msg", "Folder deleted successfully!");
    res.redirect("/folders");
  } catch (err) {
    req.flash("errors", [{ msg: "Failed to delete folder" }]);
    res.redirect("/folders");
  }
}

/**
 * Get and render files within a specific folder.
 */
async function getFiles(req, res) {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(id) },
      include: { files: true },
    });

    if (!folder) {
      req.flash("errors", [{ msg: "Folder not found" }]);
      return res.redirect("/folders");
    }

    res.render("files", {
      folder,
      user: req.user,
      msg: req.flash("msg"),
      errors: req.flash("errors"),
    });
  } catch (err) {
    req.flash("errors", [{ msg: "Error loading folder files" }]);
    res.redirect("/folders");
  }
}

async function deleteFile(req, res) {
  try {
    const { folderId, fileId } = req.params; // Extract folderId and fileId from req.params

    // Find the file to be deleted
    const file = await prisma.file.findUnique({
      where: { id: parseInt(fileId) },
    });

    if (file) {
      // Delete the file record from the database
      await prisma.file.delete({
        where: { id: parseInt(fileId) },
      });

      // Delete the file from the filesystem
      fs.unlinkSync(path.join('uploads', file.filename));

      req.flash("msg", "File deleted successfully!");
    } else {
      req.flash("errors", [{ msg: "File not found" }]);
    }

    res.redirect(`/folders/${folderId}/files`);
  } catch (err) {
    console.error("Error deleting file:", err);
    req.flash("errors", [{ msg: "Failed to delete file" }]);
    res.redirect(`/folders/${folderId}/files`);
  }
}




/**
 * Upload a file to a specific folder.
 */
/**
 * Upload a file to a specific folder.
 */
async function uploadFile(req, res) {
  upload.single('file')(req, res, async function (err) {
    if (err) {
      req.flash("errors", [{ msg: "File upload failed!" }]);
      return res.redirect(`/folders/${req.params.id}/files`);
    }

    try {
      const { id } = req.params; // folder id
      const filename = req.file.filename;
      const filepath = '/uploads/' + filename; // Relative path to access the file

      // Save file information in the database
      await prisma.file.create({
        data: {
          filename,
          filepath,
          folderId: parseInt(id),
        },
      });

      req.flash("msg", "File uploaded successfully!");
      res.redirect(`/folders/${id}/files`);
    } catch (error) {
      console.error("Error saving file information:", error);
      req.flash("errors", [{ msg: "Error saving file information to the database!" }]);
      res.redirect(`/folders/${req.params.id}/files`);
    }
  });
}

/**
 * Rename a file within a specific folder.
 */
async function renameFile(req, res) {
  try {
    const { folderId, fileId } = req.params;
    const { newFileName } = req.body;

    // Update the file in the database
    await prisma.file.update({
      where: { id: parseInt(fileId) },
      data: { filename: newFileName },
    });

    req.flash("msg", "File renamed successfully!");
    res.redirect(`/folders/${folderId}/files`);
  } catch (err) {
    req.flash("errors", [{ msg: "Failed to rename file" }]);
    res.redirect(`/folders/${folderId}/files`);
  }
}


module.exports = {
  homeGet,
  signUpGet,
  logInGet,
  signInPost,
  logInPost,
  filesGet,
  ensureAuthenticated,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getFiles,
  uploadFile,
  deleteFile,
  renameFile
};
