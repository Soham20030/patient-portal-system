import jwt from 'jsonwebtoken';
import User from '../models/User.js';


// Authentication middleware function

const authMiddleware = async(req, res, next) => {
    try {
        
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({
                message: 'Access denied. No token provided or invalid format.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if(!user){
            return res.status(401).json({
                message: 'Access denied. User not found.'
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            firstname: user.first_name,
            lastname: user.last_name
        };

        next();

    } catch (error) {
        
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({
                message: 'Access denied. Token expired.'
            });
        } else if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({
                message: 'Access denied. Invalid token'
            });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({
                message: 'Internal server error during authentication.'
            });
        }
    }
};

export default authMiddleware;