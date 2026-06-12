import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();

  // GET all wishes
  if (req.method === 'GET') {
    try {
      const wishes = await db.collection('wishes')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json(wishes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST new wish
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

    try {
      const newWish = {
        message,
        userName: session.user.name,
        userImage: session.user.image,
        createdAt: new Date(),
      };

      await db.collection('wishes').insertOne(newWish);
      return res.status(201).json(newWish);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE wish (admin only)
  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is the special admin
    if (!session || session.user.email !== 'antenehwondwosen@gmail.com') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Wish ID required' });

    try {
      const result = await db.collection('wishes').deleteOne({
        _id: new ObjectId(id)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Wish not found' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).end();
}