const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.getConnection((err, connection) => {
    if (err) {
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            console.log('Database connection was closed');
        }
        if (err.code === "ER_CON_COUNT_ERROR") {
            console.log('Database has too many connections');
        }
        if (err.code === "ECONNREFUSED") {
            console.log('Database connection was refused');
        }
    }
    if (connection) console.log('mysql pool connected'); connection.release()
    return;
})

db.query = util.promisify(db.query)

module.exports = db;