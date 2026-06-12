// pages/api/photos/index.js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // GET: fetch all photos, sorted newest first
    if (req.method === 'GET') {
      try {
        const photos = await db
          .collection('photos')
          .find({})
          .sort({ uploadDate: -1 })
          .toArray();
        
        return res.status(200).json(photos);
      } catch (error) {
        console.error('Error fetching photos:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    // POST: upload photo (if needed directly)
    if (req.method === 'POST') {
      return res.status(200).json({ message: 'Use /api/upload for photo uploads' });
    }

    // Any other method
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API /photos error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}