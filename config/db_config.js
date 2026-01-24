require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "best_todolist",
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.log("❌ Error connecting to MySQL:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
  }
});

module.exports = db;
