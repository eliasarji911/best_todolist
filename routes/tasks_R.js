const express = require("express");
const db = require("../config/db_config");
const { isLoggedIn } = require("../middelware/auth_MID");

const router = express.Router();

// GET tasks
router.get("/", isLoggedIn, (req, res) => {
  db.query(
    "SELECT * FROM tasks WHERE user_id = ?",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      res.json(rows);
    }
  );
});

// ADD task
router.post("/", isLoggedIn, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ msg: "❌ Missing text" });

  db.query(
    "INSERT INTO tasks (text, user_id) VALUES (?, ?)",
    [text, req.userId],
    (err) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      res.json({ msg: "✅ Task added" });
    }
  );
});

module.exports = router;

