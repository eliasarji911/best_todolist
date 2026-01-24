require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

require("./config/db_config"); // DB connect

const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ VERY IMPORTANT: this makes /pages/reg.html work
app.use(express.static(path.join(__dirname, "public")));

// ✅ test route
app.get("/test", (req, res) => {
  res.send("✅ SERVER WORKING");
});

// ✅ pages routes
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

// ✅ API routes (optional)
app.use("/auth", require("./routes/auth_R"));
app.use("/users", require("./routes/users_R"));
app.use("/categories", require("./routes/categories_R"));
app.use("/tasks", require("./routes/tasks_R"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});








