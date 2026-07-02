import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection('users').findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: 'Email or username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({
      email,
      username,
      password: hashed,
      createdAt: new Date()
    });

    return res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}