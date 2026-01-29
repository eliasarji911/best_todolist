const db = require("../config/db_config");


const getAllUsers = (req, res) => {
  const sql = "SELECT id, name, email, userName, created_at FROM users";

  db.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({
        msg: "❌ DB error in getAllUsers",
        err: err.message,
      });
    }

    return res.json(rows);
  });
};


const getOneUser = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT id, name, email, userName, created_at FROM users WHERE id = ?";

  db.query(sql, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        msg: "❌ DB error in getOneUser",
        err: err.message,
      });
    }

    if (rows.length === 0) {
      return res.status(404).json({ msg: "❌ User not found" });
    }

    return res.json(rows[0]);
  });
};


const deleteUser = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: "❌ DB error in deleteUser",
        err: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "❌ User not found" });
    }

    return res.json({ msg: "✅ User deleted successfully" });
  });
};


const updateUser = (req, res) => {
  const { id } = req.params;


  const allowedFields = ["name", "email", "userName"];
  const updates = [];
  const values = [];

  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ msg: "❌ No values to update" });
  }

  const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: "❌ DB error in updateUser",
        err: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "❌ User not found" });
    }

    return res.json({ msg: "✅ User updated successfully" });
  });
};

module.exports = {
  getAllUsers,
  getOneUser,
  deleteUser,
  updateUser,
};
