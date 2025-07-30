import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h'}
    );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'}
    );
};

// Register new User
const register = async( req, res ) => {
    try {
        // Only use fields that exist in schema
        const { email, password, role, first_name, last_name } = req.body;

        if(!email || !password || !role || !first_name || !last_name) {
            return res.status(400).json({
                message: 'Email, password, role, first name, and last name are required.'
            });
        }

        const existingUser = await User.findByEmail(email);
        if(existingUser) {
            return res.status(409).json({
                message: 'User with this email already exists'
            });
        }

        const validRoles = ['patient', 'doctor', 'admin'];
        if(!validRoles.includes(role)){
            return res.status(400).json({
                message: 'Invalid role. Must be patient, doctor, or admin.'
            });
        }

        const newUser = await User.create({
            email,
            password,
            role,
            first_name,
            last_name
        });

        const token = generateToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                isVerified: newUser.is_verified,
                isActive: newUser.is_active,
                createdAt: newUser.created_at
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Error registering user. Please try again.'
        });
    }
};

// Login User
const login = async(req,res) => {
    try {
        const {email, password} = req.body;

        if( !email || !password){
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        const user = await User.findByEmail(email);
        if(!user){
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Note: using "password" field from schema, not "password_hash"
        const isPasswordValid = await User.verifyPassword(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.status(200).json({
            message: 'Login Successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                isVerified: user.is_verified,
                isActive: user.is_active,
                createdAt: user.created_at
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error during Login, Please try again.'
        });
    }
};

export { register, login };
