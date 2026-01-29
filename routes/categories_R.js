const express = require("express");
const db = require("../config/db_config");
const { isLoggedIn } = require("../middelware/auth_MID");

const router = express.Router();

function parseId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ msg: "❌ Invalid id" });
  }
  req.categoryId = id;
  next();
}

// ✅ GET all categories for logged user
router.get("/", isLoggedIn, (req, res) => {
  db.query(
    "SELECT * FROM categories WHERE user_id = ? ORDER BY id DESC",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      res.json(rows);
    }
  );
});

// ✅ GET one category
router.get("/:id", isLoggedIn, parseId, (req, res) => {
  db.query(
    "SELECT * FROM categories WHERE id = ? AND user_id = ?",
    [req.categoryId, req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      if (rows.length === 0) return res.status(404).json({ msg: "❌ Category not found" });
      res.json(rows[0]);
    }
  );
});

// ✅ ADD category
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

// ✅ UPDATE category name
router.patch("/:id", isLoggedIn, parseId, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ msg: "❌ Missing name" });

  db.query(
    "UPDATE categories SET name = ? WHERE id = ? AND user_id = ?",
    [name, req.categoryId, req.userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      if (result.affectedRows === 0) return res.status(404).json({ msg: "❌ Category not found" });
      res.json({ msg: "✅ Category updated" });
    }
  );
});

// ✅ DELETE category + all tasks inside it
router.delete("/:id", isLoggedIn, parseId, (req, res) => {
  // 1) delete tasks in this category (only for this user)
  db.query(
    "DELETE FROM tasks WHERE category_id = ? AND user_id = ?",
    [req.categoryId, req.userId],
    (err) => {
      if (err) return res.status(500).json({ msg: "❌ DB error deleting tasks" });

      // 2) delete the category
      db.query(
        "DELETE FROM categories WHERE id = ? AND user_id = ?",
        [req.categoryId, req.userId],
        (err2, result2) => {
          if (err2) return res.status(500).json({ msg: "❌ DB error deleting category" });
          if (result2.affectedRows === 0) return res.status(404).json({ msg: "❌ Category not found" });

          res.json({ msg: "✅ Category and its tasks deleted" });
        }
      );
    }
  );
});

module.exports = router;

