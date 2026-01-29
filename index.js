require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const jwt = require("jsonwebtoken");

require("./config/db_config"); // DB connect

const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Serve only scripts + styles as static
app.use("/styles", express.static(path.join(__dirname, "public/styles")));
app.use("/scripts", express.static(path.join(__dirname, "public/scripts")));

// ✅ Protect /pages/* (except login + register pages)
function protectPages(req, res, next) {
  const openPages = ["/login.html", "/reg.html"];
  if (openPages.includes(req.path)) return next();

  const token = req.cookies.token;
  if (!token) return res.redirect("/pages/login.html");

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.redirect("/pages/login.html");
  }
}

app.use("/pages", protectPages, express.static(path.join(__dirname, "public/pages")));

// ✅ test route
app.get("/test", (req, res) => {
  res.send("✅ SERVER WORKING");
});

// ✅ pages shortcuts
app.get("/", (req, res) => {
  res.redirect("/pages/index.html");
});

app.get("/login", (req, res) => {
  res.redirect("/pages/login.html");
});

app.get("/reg", (req, res) => {
  res.redirect("/pages/reg.html");
});

app.get("/cat", (req, res) => {
  res.redirect("/pages/categories.html");
});

// ✅ Support direct /users.html & /categories.html links
app.get("/users.html", (req, res) => {
  res.redirect("/pages/users.html");
});

app.get("/categories.html", (req, res) => {
  res.redirect("/pages/categories.html");
});

app.get("/usersPage", (req, res) => {
  res.redirect("/pages/users.html");
});

// ✅ API routes
app.use("/auth", require("./routes/auth_R"));
app.use("/users", require("./routes/users_R"));
app.use("/categories", require("./routes/categories_R"));
app.use("/tasks", require("./routes/tasks_R"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});









