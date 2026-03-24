import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import User from './models/User.js';
import { getStats } from './controllers/dashboardController.js';
import userRoutes from './routes/userRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import timeEntryRoutes from './routes/timeEntryRoutes.js';
import subTaskRoutes from './routes/subTaskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

mongoose.set('bufferCommands', false);

const app = express();
const PORT = 5099;
console.log('--- SERVER VERSION 2.1 (RECONSTRUCTED) ---');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ✅ STEP 7: ADD DEBUG LOG
app.use((req, res, next) => {
  console.log("API HIT:", req.method, req.url);
  next();
});

// --- EMERGENCY & DEBUG ROUTES ---
app.get('/api/debug/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       return res.json({ status: 'offline', message: 'Database is not connected yet.' });
    }
    const users = await User.find({}).select('-password').limit(5);
    res.json({ status: 'success', dbState: mongoose.connection.readyState, count: users.length, users });
  } catch (err) {
    res.json({ status: 'error', message: err.message });
  }
});

app.post('/api/users/login/emergency', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@gmail.com' && password === 'admin@123') {
    return res.json({
        _id: "65f8a0000000000000000001",
        name: 'System Admin (Demo)',
        email: 'admin@gmail.com',
        role: 'admin',
        token: 'demo-token-bypass-67890'
    });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));
app.get("/test", (req, res) => {
  res.send("Server working");
});

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresher-ledger')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB Error:', err));

// --- CORE API ROUTES ---
app.get('/api/dashboard/stats', getStats);

app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
console.log("Task routes loaded");
app.use('/api/time', timeEntryRoutes);
app.use('/api/subtasks', subTaskRoutes);

app.get('/', (req, res) => {
  res.send('Work Ledger API is running');
});

// --- ERROR HANDLING ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
