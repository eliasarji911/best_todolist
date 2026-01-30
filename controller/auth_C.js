const db = require("../config/db_config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: "2h" });
}


const register = (req, res) => {
  const { name, email, userName, pass } = req.body;

  if (!name || !email || !userName || !pass) {
    return res.status(400).json({ msg: "❌ Missing fields" });
  }

  const hashed = bcrypt.hashSync(pass, 10);

  const sql =
    "INSERT INTO users (name, email, userName, pass) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, userName, hashed], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "❌ Register failed", err: err.message });
    }

    return res.status(201).json({ msg: "✅ Registered successfully" });
  });
};


const login = (req, res) => {
  const { userName, pass } = req.body;

  if (!userName || !pass) {
    return res.status(400).json({ msg: "❌ Missing fields" });
  }

  const sql = "SELECT * FROM users WHERE userName = ?";
  db.query(sql, [userName], (err, rows) => {
    if (err) return res.status(500).json({ msg: "❌ Login error" });

    if (rows.length === 0) {
      return res.status(401).json({ msg: "❌ User not found" });
    }

    const user = rows[0];
    const ok = bcrypt.compareSync(pass, user.pass);

    if (!ok) {
      return res.status(401).json({ msg: "❌ Wrong password" });
    }

    const token = createToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    return res.json({ msg: "✅ Login success" });
  });
};


const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "✅ Logged out" });
};

module.exports = { register, login, logout };
