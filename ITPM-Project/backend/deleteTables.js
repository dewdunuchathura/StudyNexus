import mongoose from 'mongoose';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();
connectDB();

const deleteTables = async () => {
  try {
    console.log('🗑️ Deleting collections...');
    
    // Delete the groups table
    const groupsDeleted = await mongoose.connection.db.dropCollection('creategroups');
    console.log('✅ creategroups collection deleted:', groupsDeleted);
    
    // Delete the group requests table
    const requestsDeleted = await mongoose.connection.db.dropCollection('grouprequests');
    console.log('✅ grouprequests collection deleted:', requestsDeleted);
    
    console.log('🎉 All group-related tables deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error deleting collections:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the deletion
deleteTables();
