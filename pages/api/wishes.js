import { getUserFromToken } from '../../lib/auth';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();

  if (req.method === 'GET') {
    try {
      const { uploaderEmail } = req.query;
      const filter = uploaderEmail ? { uploaderEmail } : {};
      const wishes = await db.collection('wishes')
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json(wishes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

    try {
      const newWish = {
        message,
        userName: user.username,
        userImage: user.image || null,
        uploaderEmail: user.email,
        createdAt: new Date()
      };
      await db.collection('wishes').insertOne(newWish);
      return res.status(201).json(newWish);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Wish ID required' });

    try {
      const wish = await db.collection('wishes').findOne({ _id: new ObjectId(id) });
      if (!wish) return res.status(404).json({ error: 'Wish not found' });

      const isAdmin = user.email === 'antenehwondwosen@gmail.com';
      const isOwner = user.email === wish.uploaderEmail;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Forbidden – not your wish and not admin' });
      }

      const result = await db.collection('wishes').deleteOne({ _id: new ObjectId(id) });
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