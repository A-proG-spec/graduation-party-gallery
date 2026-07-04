import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();

    if (req.method === 'GET') {
      const { uploaderEmail } = req.query;
      const filter = uploaderEmail ? { uploaderEmail } : {};

      // Step 1: Fetch photos
      const photos = await db.collection('photos')
        .find(filter)
        .sort({ uploadDate: -1 })
        .toArray();

      // Step 2: Get all photo IDs as strings
      const photoIds = photos.map(p => p._id.toString());

      // Step 3: Fetch all comments for these photos
      const comments = await db.collection('comments')
        .find({ photoId: { $in: photoIds } })
        .toArray();

      // Step 4: Count comments per photo
      const commentCountMap = {};
      comments.forEach(c => {
        commentCountMap[c.photoId] = (commentCountMap[c.photoId] || 0) + 1;
      });

      // Step 5: Attach commentCount to each photo
      const result = photos.map(photo => ({
        ...photo,
        commentCount: commentCountMap[photo._id.toString()] || 0
      }));

      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      return res.status(200).json({ message: 'Use /api/upload for photo uploads' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API /photos error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}