const express = require("express");
const db = require("../config/db_config");
const { isLoggedIn } = require("../middelware/auth_MID");

const router = express.Router();

// GET all categories for logged user
router.get("/", isLoggedIn, (req, res) => {
  db.query(
    "SELECT * FROM categories WHERE user_id = ?",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      res.json(rows);
    }
  );
});

// ADD category
router.post("/", isLoggedIn, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ msg: "❌ Missing name" });

  db.query(
    "INSERT INTO categories (name, user_id) VALUES (?, ?)",
    [name, req.userId],
    (err) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      res.json({ msg: "✅ Category added" });
    }
  );
});

module.exports = router;
