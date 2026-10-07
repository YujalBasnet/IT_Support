import mysql from 'mysql2';

const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'it_support',
});

database.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }else{
    console.log('Connected to the database successfully.');
  }
});

export default database;