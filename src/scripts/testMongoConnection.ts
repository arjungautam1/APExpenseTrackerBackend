import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testMongoConnection() {
  try {
    console.log('Testing MongoDB Atlas connection...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI not found in environment variables');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas connected successfully!');
    
    // Test a simple operation
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log('📊 Available collections:', collections.map(c => c.name));
    }
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
  }
}

testMongoConnection();
