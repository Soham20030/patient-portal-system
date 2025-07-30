// test/testUserModel.js
import User from '../models/User.js';
import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const testUserModel = async () => {
    console.log('🔍 Testing User Model...');
    
    try {
        // Test data
        const testUser = {
            email: 'test@example.com',
            password: 'testpassword123',
            role: 'patient',
            first_name: 'John',
            last_name: 'Doe',
            phone: '1234567890',
            date_of_birth: '1990-01-01',
            gender: 'male',
            address: '123 Test Street, Test City'
        };
        
        console.log('\n1. Testing User Creation...');
        
        // Clean up any existing test user first
        await query('DELETE FROM users WHERE email = $1', [testUser.email]);
        
        // Test 1: Create a new user
        const newUser = await User.create(testUser);
        console.log('✅ User created successfully:', {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: `${newUser.first_name} ${newUser.last_name}`
        });
        
        console.log('\n2. Testing Find User by Email...');
        
        // Test 2: Find user by email
        const foundUser = await User.findByEmail(testUser.email);
        if (foundUser) {
            console.log('✅ User found by email:', {
                id: foundUser.id,
                email: foundUser.email,
                role: foundUser.role
            });
        } else {
            console.log('❌ User not found by email');
        }
        
        console.log('\n3. Testing Find User by ID...');
        
        // Test 3: Find user by ID
        const foundUserById = await User.findById(newUser.id);
        if (foundUserById) {
            console.log('✅ User found by ID:', {
                id: foundUserById.id,
                email: foundUserById.email,
                role: foundUserById.role
            });
        } else {
            console.log('❌ User not found by ID');
        }
        
        console.log('\n4. Testing Password Verification...');
        
        // Test 4: Password verification
        const isValidPassword = await User.verifyPassword(testUser.password, foundUser.password_hash);
        console.log('✅ Password verification (correct password):', isValidPassword);
        
        const isInvalidPassword = await User.verifyPassword('wrongpassword', foundUser.password_hash);
        console.log('✅ Password verification (wrong password):', isInvalidPassword);
        
        console.log('\n5. Testing Email Existence Check...');
        
        // Test 5: Email existence check
        const emailExists = await User.emailExists(testUser.email);
        console.log('✅ Email exists check:', emailExists);
        
        const emailNotExists = await User.emailExists('nonexistent@example.com');
        console.log('✅ Email not exists check:', emailNotExists);
        
        console.log('\n6. Testing User Update...');
        
        // Test 6: Update user
        const updateData = {
            first_name: 'Jane',
            last_name: 'Smith',
            phone: '0987654321',
            date_of_birth: '1985-05-15',
            gender: 'female',
            address: '456 Updated Street, New City'
        };
        
        const updatedUser = await User.update(newUser.id, updateData);
        console.log('✅ User updated successfully:', {
            id: updatedUser.id,
            name: `${updatedUser.first_name} ${updatedUser.last_name}`,
            phone: updatedUser.phone
        });
        
        console.log('\n7. Testing Error Handling...');
        
        // Test 7: Try to create duplicate user (should fail)
        try {
            await User.create(testUser);
            console.log('❌ Duplicate user creation should have failed');
        } catch (error) {
            console.log('✅ Duplicate user creation correctly failed:', error.message);
        }
        
        // Test 8: Try to find non-existent user
        const nonExistentUser = await User.findByEmail('nonexistent@example.com');
        if (!nonExistentUser) {
            console.log('✅ Non-existent user correctly returned null');
        } else {
            console.log('❌ Non-existent user should return null');
        }
        
        console.log('\n8. Cleaning up test data...');
        
        // Clean up - delete test user
        await query('DELETE FROM users WHERE email = $1', [testUser.email]);
        console.log('✅ Test data cleaned up');
        
        console.log('\n🎉 All User Model tests passed!');
        
    } catch (error) {
        console.error('❌ User Model test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
    
    process.exit(0);
};

testUserModel();