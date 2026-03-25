import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresher-ledger';
  
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
  };

  try {
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE] Connection Error: ${error.message}`);
    
    // Provide beginner-friendly tips based on error
    if (error.message.includes('ECONNREFUSED')) {
      console.log('TIP: Local MongoDB is OFF. Run "net start MongoDB" in Admin CMD.');
    } else if (error.message.includes('Authentication failed')) {
      console.log('TIP: Check your MONGODB_URI password in Render dashboard.');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.log('TIP: Your IP might not be whitelisted in MongoDB Atlas (Access 0.0.0.0/0).');
    }

    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Handle mid-runtime disconnections
mongoose.connection.on('disconnected', () => {
  console.warn('[DATABASE] Connection lost! Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

export default connectDB;
