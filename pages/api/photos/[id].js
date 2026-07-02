import { getUserFromToken } from '../../../lib/auth';
import clientPromise from '../../../lib/mongodb';
import cloudinary from '../../../lib/cloudinary';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized – no token' });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized – invalid token' });
  }

  // Admin only – hardcoded email
  if (user.email !== 'antenehwondwosen@gmail.com') {
    return res.status(403).json({ error: 'Forbidden – admin only' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Photo ID required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const photo = await db.collection('photos').findOne({ _id: new ObjectId(id) });
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete from Cloudinary
    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId);
    }

    // Delete from DB
    await db.collection('photos').deleteOne({ _id: new ObjectId(id) });

    // Delete associated comments
    await db.collection('comments').deleteMany({ photoId: id });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}