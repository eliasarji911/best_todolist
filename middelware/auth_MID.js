const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ msg: "❌ Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ msg: "❌ Invalid token" });
  }
}

module.exports = { isLoggedIn };
