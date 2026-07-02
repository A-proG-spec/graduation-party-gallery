import { getUserFromToken } from '../../../lib/auth';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { photoId } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db();

    const photo = await db.collection('photos').findOne({ _id: new ObjectId(photoId) });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const userIdentifier = user.email;
    const likes = photo.likes || [];

    if (likes.includes(userIdentifier)) {
      await db.collection('photos').updateOne(
        { _id: new ObjectId(photoId) },
        { $pull: { likes: userIdentifier } }
      );
    } else {
      await db.collection('photos').updateOne(
        { _id: new ObjectId(photoId) },
        { $addToSet: { likes: userIdentifier } }
      );
    }

    const updated = await db.collection('photos').findOne({ _id: new ObjectId(photoId) });
    return res.status(200).json({ likes: updated.likes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}