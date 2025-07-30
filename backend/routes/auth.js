import express from 'express';
import {register, login} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public Routes

router.post('/register', register);
router.post('/login' , login);

// Protected Routes

router.get('/profile', authMiddleware, (req,res)=>{
    try {
        res.json({
            message: 'Profile retrieved successfully',
            user: req.user
        });

    } catch (error) {
        console.error('Profile route error', error);
        res.status(500).json({
            message: 'Error retrieving profile'
        });
    }
});

// Test protected route

router.get('/test', authMiddleware, (req,res)=>{
    res.json({
        message: 'Authentication working!',
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

export default router;