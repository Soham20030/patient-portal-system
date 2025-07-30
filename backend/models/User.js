// Import the database connection
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

// User model class with static methods for database operations
class User {
    // Create a new user
    static async create(userData) {
        try {
            // Destructure user data from the request - only use fields that exist in schema
            const { email, password, role, first_name, last_name } = userData;

            // Hash password using environment variable for salt rounds
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // SQL query to insert new user - match actual schema columns
            const sql = `
                INSERT INTO users (email, password, role, first_name, last_name)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, email, role, first_name, last_name, is_verified, is_active, created_at
            `;

            // Parameters for the SQL query
            const values = [email, hashedPassword, role, first_name, last_name];

            // Execute the query and return the created user
            const result = await query(sql, values);
            return result.rows[0];
        } catch (error) {
            // Log the error and re-throw for handling in controllers
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Find user by email (used for login)
    static async findByEmail(email) {
        try {
            // SQL query to find user by email
            const sql = 'SELECT * FROM users WHERE email = $1';
            // Execute query and return user if found
            const result = await query(sql, [email]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    // Find user by ID (used for authentication verification)
    static async findById(id) {
        try {
            // SQL query to find user by ID (excluding password for security)
            const sql = 'SELECT id, email, role, first_name, last_name, is_verified, is_active, created_at FROM users WHERE id = $1';
            // Execute query and return user if found
            const result = await query(sql, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Verify password during login
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            // Compare plain password with hashed password
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error verifying password:', error);
            throw error;
        }
    }

    // Update user profile information
    static async update(id, updateData) {
        try {
            // Only update fields that exist in schema
            const { first_name, last_name } = updateData;

            // SQL query to update user information
            const sql = `
                UPDATE users
                SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING id, email, role, first_name, last_name, is_verified, is_active, updated_at
            `;

            // Parameters for the SQL query
            const values = [first_name, last_name, id];

            // Execute query and return updated user
            const result = await query(sql, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Check if email already exists (used during registration)
    static async emailExists(email) {
        try {
            // SQL query to check if email exists
            const sql = 'SELECT COUNT(*) FROM users WHERE email = $1';
            // Execute query and return boolean
            const result = await query(sql, [email]);
            return parseInt(result.rows[0].count) > 0;
        } catch (error) {
            console.error('Error checking email existence:', error);
            throw error;
        }
    }

    // Soft delete user (set is_active to false)
    static async delete(id) {
        try {
            const sql = `
                UPDATE users 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 
                RETURNING id, email, role, first_name, last_name, is_active, updated_at
            `;
            const result = await query(sql, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Get all active users (admin function)
    static async findAll(options = {}) {
        try {
            const { limit = 10, offset = 0, role = null } = options;
            
            let sql = 'SELECT id, email, role, first_name, last_name, is_verified, is_active, created_at FROM users WHERE is_active = TRUE';
            const values = [];
            let paramCount = 0;

            // Filter by role if specified
            if (role) {
                paramCount++;
                sql += ` AND role = $${paramCount}`;
                values.push(role);
            }

            // Add pagination
            sql += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
            values.push(limit, offset);

            const result = await query(sql, values);
            return result.rows;
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    }
}

// Export the User class as default export
export default User;
