const express = require("express");
const db = require("../config/db_config");
const { isLoggedIn } = require("../middelware/auth_MID");

const router = express.Router();

function parseId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) return res.status(400).json({ msg: "❌ Invalid id" });
  req.taskId = id;
  next();
}

router.get("/", isLoggedIn, (req, res) => {
  db.query(
    `SELECT t.*, c.name AS category_name
     FROM tasks t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = ?
     ORDER BY t.id DESC`,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      res.json(rows);
    }
  );
});


router.post("/", isLoggedIn, (req, res) => {
  const { text, category_id } = req.body;
  if (!text) return res.status(400).json({ msg: "❌ Missing text" });

  const catId =
    category_id === undefined || category_id === null || category_id === ""
      ? null
      : parseInt(category_id);

  db.query(
    "INSERT INTO tasks (text, user_id, category_id) VALUES (?, ?, ?)",
    [text, req.userId, catId],
    (err) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      res.json({ msg: "✅ Task added" });
    }
  );
});


function updateTask(req, res) {
  const { text, category_id } = req.body;
  if (!text) return res.status(400).json({ msg: "❌ Missing text" });

  const catId =
    category_id === undefined || category_id === null || category_id === ""
      ? null
      : parseInt(category_id);

  db.query(
    "UPDATE tasks SET text = ?, category_id = ? WHERE id = ? AND user_id = ?",
    [text, catId, req.taskId, req.userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      if (result.affectedRows === 0) return res.status(404).json({ msg: "❌ Task not found" });
      res.json({ msg: "✅ Task updated" });
    }
  );
}

router.put("/:id", isLoggedIn, parseId, updateTask);
router.patch("/:id", isLoggedIn, parseId, updateTask);


function setDone(req, res) {
  const { is_done } = req.body;
  if (is_done === undefined) return res.status(400).json({ msg: "❌ Missing is_done" });

  db.query(
    "UPDATE tasks SET is_done = ? WHERE id = ? AND user_id = ?",
    [is_done ? 1 : 0, req.taskId, req.userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      if (result.affectedRows === 0) return res.status(404).json({ msg: "❌ Task not found" });
      res.json({ msg: "✅ Updated" });
    }
  );
}

router.patch("/:id/done", isLoggedIn, parseId, setDone);
router.put("/:id/done", isLoggedIn, parseId, setDone);


router.patch("/done/:id", isLoggedIn, parseId, setDone);
router.put("/done/:id", isLoggedIn, parseId, setDone);


router.delete("/:id", isLoggedIn, parseId, (req, res) => {
  db.query(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [req.taskId, req.userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "❌ DB error" });
      if (result.affectedRows === 0) return res.status(404).json({ msg: "❌ Task not found" });
      res.json({ msg: "✅ Task deleted" });
    }
  );
});

module.exports = router;




