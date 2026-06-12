import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';
import cloudinary from '../../../lib/cloudinary';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  // Check admin via session
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.email !== 'antenehwondwosen@gmail.com') {
    return res.status(403).json({ error: 'Forbidden - Admin only' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const photo = await db.collection('photos').findOne({
      _id: new ObjectId(id),
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete from Cloudinary
    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId);
    }

    // Delete from DB
    await db.collection('photos').deleteOne({
      _id: new ObjectId(id),
    });

    // Also delete all comments for this photo
    await db.collection('comments').deleteMany({
      photoId: id,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Delete failed' });
  }
}