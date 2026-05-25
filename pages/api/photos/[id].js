import clientPromise from '../../../lib/mongodb';
import cloudinary from '../../../lib/cloudinary';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Photo ID is required' });
  }

  try {
    // Get admin credentials from request body
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    // Verify admin credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized - Invalid admin credentials' });
    }

    const client = await clientPromise;
    const db = client.db('graduation_party_gallery');

    // Find the photo first to get Cloudinary public_id
    const photo = await db.collection('photos').findOne({ _id: new ObjectId(id) });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.cloudinaryPublicId);

    // Delete from MongoDB
    await db.collection('photos').deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
}