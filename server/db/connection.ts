import mongoose from 'mongoose';
import { log } from '../vite';

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Function to connect to MongoDB
export async function connectToDatabase() {
  // Default to localhost in development if not provided
  const connectionString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexusgear';
  
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionString);
    log('Connected to MongoDB successfully', 'mongodb');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'mongodb');
    });

    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', 'mongodb');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      log('MongoDB connection closed due to app termination', 'mongodb');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    log(`Error connecting to MongoDB: ${error}`, 'mongodb');
    throw error;
  }
}