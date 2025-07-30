// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS Configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Basic Route for Testing
app.get('/', (req, res) => {
    res.json({
        message: "Patient Portal API server is running!",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        url: req.originalUrl
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error"
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API URL: http://localhost:${PORT}`);
});

// Export app for testing
export default app;
