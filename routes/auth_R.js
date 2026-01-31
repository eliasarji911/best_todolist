const express = require("express");
const { isLoggedIn } = require("../middelware/auth_MID");

const { register, login, logout } = require("../controller/auth_C");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ msg: "✅ Logged out" });
  });
});


module.exports = router;


