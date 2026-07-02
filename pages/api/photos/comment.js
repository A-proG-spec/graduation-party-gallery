import { getUserFromToken } from '../../../lib/auth';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();

  if (req.method === 'GET') {
    const { photoId } = req.query;
    try {
      const comments = await db.collection('comments')
        .find({ photoId })
        .sort({ createdAt: 1 })
        .toArray();
      return res.status(200).json(comments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { photoId, text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text empty' });

    try {
      const newComment = {
        photoId,
        text,
        userName: user.username,
        userImage: user.image || null,
        createdAt: new Date()
      };
      await db.collection('comments').insertOne(newComment);
      return res.status(201).json(newComment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getUserFromToken(token);
    if (!user || user.email !== 'antenehwondwosen@gmail.com') {
      return res.status(403).json({ error: 'Forbidden – Admin only' });
    }

    const { commentId } = req.query;
    if (!commentId) return res.status(400).json({ error: 'Comment ID required' });

    try {
      const result = await db.collection('comments').deleteOne({
        _id: new ObjectId(commentId)
      });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).end();
}