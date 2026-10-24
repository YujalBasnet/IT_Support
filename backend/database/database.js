import "dotenv/config";
import mysql from "mysql2";

const database = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "it_support",
  port: Number(process.env.DB_PORT) || 3306,
});

database.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }

  console.log("Connected to the database successfully.");
});

export default database;