import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

async function testServerConnection() {
  try {
    console.log('Testing server MongoDB connection...');
    
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI not found');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    await mongoose.connection.asPromise();
    
    console.log('✅ Connected to MongoDB');
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    const userCount = await User.countDocuments();
    console.log('✅ User count:', userCount);
    
    // Test finding a user
    const user = await User.findOne({ email: 'test@example.com' });
    console.log('✅ Test user found:', user ? 'Yes' : 'No');
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testServerConnection();
