const express = require("express");
const db = require("../config/db_config");
const { isLoggedIn } = require("../middelware/auth_MID");
const { isValidId, valuesToEdit } = require("../middelware/users_MID");

const router = express.Router();

// ✅ Teacher requirement: ALL routes must be protected by login
router.use(isLoggedIn);

// ✅ GET all users
router.get("/", (req, res) => {
  db.query(
    "SELECT id, name, email, userName FROM users ORDER BY id DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      res.json(rows);
    }
  );
});

// ✅ GET one user
router.get("/:id", isValidId, (req, res) => {
  db.query(
    "SELECT id, name, email, userName FROM users WHERE id = ?",
    [req.id],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      if (rows.length === 0) return res.status(404).json({ msg: "❌ User not found" });
      res.json(rows[0]);
    }
  );
});

// ✅ DELETE user
router.delete("/:id", isValidId, (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.id], (err, result) => {
    if (err) return res.status(500).json({ msg: "❌ DB error" });
    if (result.affectedRows === 0) return res.status(404).json({ msg: "❌ User not found" });
    res.json({ msg: "✅ User deleted" });
  });
});

// ✅ UPDATE user (name/email/userName)
router.patch("/:id", isValidId, valuesToEdit, (req, res) => {
  const keys = Object.keys(req.user);
  const values = Object.values(req.user);
  const set = keys.map((k) => `${k} = ?`).join(", ");

  const sql = `UPDATE users SET ${set} WHERE id = ?`;

  db.query(sql, [...values, req.id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ msg: "❌ Email/UserName already exists" });
      }
      return res.status(500).json({ msg: "❌ DB error" });
    }

    if (result.affectedRows === 0) return res.status(404).json({ msg: "❌ User not found" });
    res.json({ msg: "✅ User updated" });
  });
});

module.exports = router;

