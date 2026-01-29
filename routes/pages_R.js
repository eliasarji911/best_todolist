const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
  res.redirect("/pages/index.html");
});

router.get("/login", (req, res) => {
  res.redirect("/pages/login.html");
});

router.get("/reg", (req, res) => {
  res.redirect("/pages/reg.html");
});

router.get("/cat", (req, res) => {
  res.redirect("/pages/categories.html");
});

module.exports = router;






