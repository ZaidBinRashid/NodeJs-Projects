const express = require("express");
const URL = require("../models/Url");
const { restrictTo } = require("../middlewares/auth");

const router = express.Router();

router.get('/admin/user')

router.get("/", restrictTo(['NORMAL']), async (req, res) => {
  const allUrls = await URL.find({ createdBy: req.user._id });
  return res.render("home", {
    urls: allUrls,
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.get("/login", (req, res) => {
  return res.render("login");
});
module.exports = router;
