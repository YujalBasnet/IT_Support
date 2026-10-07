import mysql from "mysql2";

const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

database.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }

  console.log("Connected to the database successfully.");
});

export default database;