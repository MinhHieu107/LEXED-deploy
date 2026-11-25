const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Set DB_SSL_CA to the PEM CA certificate for hosted MySQL providers.
    ssl: process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : undefined,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
