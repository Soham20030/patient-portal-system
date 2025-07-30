// test/simpleDatabaseTest.js
import { testConnection, query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const testDatabase = async () => {
    console.log('🔍 Testing Database Connection...');
    
    try {
        // Test 1: Basic connection
        console.log('\n1. Testing basic connection...');
        const connected = await testConnection();
        
        if (!connected) {
            console.log('❌ Database connection failed');
            return;
        }
        
        // Test 2: Simple query test
        console.log('\n2. Testing simple query...');
        const timeResult = await query('SELECT NOW() as current_time');
        console.log('✅ Query successful. Current time:', timeResult.rows[0].current_time);
        
        // Test 3: Check if users table exists (simple approach)
        console.log('\n3. Checking if users table exists...');
        try {
            const userCount = await query('SELECT COUNT(*) as count FROM users');
            console.log('✅ Users table exists with', userCount.rows[0].count, 'records');
        } catch (error) {
            if (error.message.includes('relation "users" does not exist')) {
                console.log('❌ Users table does not exist');
                console.log('📝 You need to create the users table first');
                console.log('📝 Run the SQL schema from your project overview to create tables');
            } else {
                console.log('❌ Error checking users table:', error.message);
            }
        }
        
        console.log('\n✅ Basic database tests completed!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
    
    process.exit(0);
};

testDatabase();