import jwt from 'jsonwebtoken';
import clientPromise from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export async function getUserFromToken(token) {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection('users').findOne({ email: decoded.email });
  return user;
}