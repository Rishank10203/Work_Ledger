import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Emergency Bypass
    if (token === 'demo-token-bypass-67890') {
      req.user = { _id: '65f8a0000000000000000001', name: 'Demo Admin', email: 'admin@gmail.com', role: 'admin' };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
    
    if (mongoose.connection.readyState === 1) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      req.user = { _id: decoded.id, role: 'admin' }; // Assume admin if DB is down but token is valid
    }

    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    console.error('Auth Error Details:', {
        message: error.message,
        token: req.headers.authorization?.substring(0, 20) + '...',
        secret: process.env.JWT_SECRET ? 'SET' : 'MISSING'
    });
    res.status(401).json({ 
        message: 'Not authorized', 
        reason: error.message === 'jwt expired' ? 'Token expired' : 'Invalid token' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied: Role not authorized' });
    }
    next();
  };
};

export const authorizeRoles = authorize;
