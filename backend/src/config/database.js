const dns = require('dns');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_STANDARD;

if (!uri) {
  throw new Error('Please add MONGODB_URI to your environment (.env) file');
}

const dnsServers = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

try {
  dns.setServers(dnsServers);
  console.log('DNS servers set for Node:', dnsServers.join(', '));
} catch (error) {
  console.warn('Could not override DNS servers:', error.message);
}

const maskMongoUri = (value) => {
  return value.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
};

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', uri ? 'Configured' : 'Missing');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB with Mongoose...');
    console.log('Connection URI (masked):', maskMongoUri(uri));

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Connection state:', mongoose.connection.readyState);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected - will attempt to reconnect');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

const getDB = () => {
  const db = mongoose.connection.db;
  if (!db) {
    console.error('MongoDB connection not initialized. Connection state:', mongoose.connection.readyState);
  }
  return db;
};

module.exports = { connectDB, getDB };
