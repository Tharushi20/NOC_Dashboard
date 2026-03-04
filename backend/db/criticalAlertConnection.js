import mongoose from 'mongoose';

let criticalConn = null;
let warnedMissingUri = false;

export function getCriticalAlertConnection() {
  if (criticalConn) return criticalConn;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI2;
  if (!uri) {
    if (!warnedMissingUri) {
      console.warn('Critical Alert DB URI not set (MONGODB_URI or MONGO_URI2). Critical Alert module will be disabled.');
      warnedMissingUri = true;
    }
    return null;
  }

  criticalConn = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  criticalConn.on('connected', () => {
    console.log('Connected to MongoDB (Critical Alert DB)');
  });
  criticalConn.on('error', (err) => {
    console.error('Critical Alert MongoDB connection error:', err);
  });

  return criticalConn;
}

export async function ensureCriticalAlertConnectionReady() {
  const conn = getCriticalAlertConnection();
  if (!conn) return null;
  // Wait for initial connection (Mongoose queues ops, but this makes startup seeding deterministic)
  await conn.asPromise();
  return conn;
}

