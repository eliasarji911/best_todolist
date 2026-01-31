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

router.get("/me", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ msg: "❌ Not logged in" });
  }

  db.query(
    "SELECT username, name FROM users WHERE user_id = ?",
    [req.session.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      if (!rows.length) return res.status(404).json({ msg: "❌ User not found" });

      res.json({
        userName: rows[0].username,
        name: rows[0].name
      });
    }
  );
});



module.exports = router;


