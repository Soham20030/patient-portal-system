// config/database.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Database Configuration
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'patient_portal',
    password: process.env.DB_PASSWORD || 'Somsid@2014',
    port: process.env.DB_PORT || 5432,
    // Connection pool settings
    max: 50, // Maximum number of connections
    idleTimeoutMillis: 10000, // Close idle connection after 10 seconds
    connectionTimeoutMillis: 5000, // Return error after 5 seconds if connection cannot be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database Connection error:', err);
    process.exit(-1);
});

// Function to test database connection
const testConnection = async() => {
    try {
        const client = await pool.connect();
        console.log('Database Connection successful');
        client.release();
        return true;
    } catch (err) {
        console.error('Database connection failed:', err);
        return false;
    }
};

// Function to execute queries
const query = async(text, params) => {
    try {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', {text, duration, rows: res.rowCount});
        return res;
    } catch (err) {
        console.error('Query error:', err);
        throw err;
    }
};

// Function to get a client from the pool
const getClient = async() => {
    return await pool.connect();
};

export {
    pool,
    query,
    getClient,
    testConnection
};