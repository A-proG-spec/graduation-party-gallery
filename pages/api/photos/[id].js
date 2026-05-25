import clientPromise from '../../../lib/mongodb';
import cloudinary from '../../../lib/cloudinary';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    let { username, password } =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};

    const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (
      username !== ADMIN_USERNAME ||
      password !== ADMIN_PASSWORD
    ) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db('graduation_party_gallery');

    const photo = await db.collection('photos').findOne({
      _id: new ObjectId(id),
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // delete from cloudinary
    if (photo.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
    }

    // delete from DB
    await db.collection('photos').deleteOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Delete failed' });
  }
}