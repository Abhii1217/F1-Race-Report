const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "f1_race_report",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  typeCast: function (field, next) {
    if (field.type === "JSON") {
      return JSON.parse(field.string('utf8'));
    }
    return next();
  },
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    connection.release();
  } catch (err) {
    console.error("ERROR: MySQL connection failed:", err.message);
    console.error("   Check your .env DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
    process.exit(1);
  }
}

testConnection();

module.exports = pool;