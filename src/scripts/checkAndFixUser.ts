import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function checkAndFixUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find the test user
    const user = await User.findOne({ email: 'test@example.com' }).select('+password');
    
    if (!user) {
      console.log('Test user not found. Creating one...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword
      });
      console.log('Test user created successfully!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      return;
    }

    console.log('Test user found:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Password hash exists:', !!user.password);

    // Test password matching
    const testPassword = 'password123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password match test:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch. Updating password...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      user.password = hashedPassword;
      await user.save();
      console.log('Password updated successfully!');
    } else {
      console.log('Password is correct!');
    }

    console.log('\nLogin credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error checking/fixing user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
checkAndFixUser();
