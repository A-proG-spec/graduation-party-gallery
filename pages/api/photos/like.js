import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { photoId } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db();

    const photo = await db.collection('photos').findOne({
      _id: new ObjectId(photoId),
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const userIdentifier = session.user.email;

    const likes = photo.likes || [];

    if (likes.includes(userIdentifier)) {
      await db.collection('photos').updateOne(
        { _id: new ObjectId(photoId) },
        {
          $pull: {
            likes: userIdentifier,
          },
        }
      );
    } else {
      await db.collection('photos').updateOne(
        { _id: new ObjectId(photoId) },
        {
          $addToSet: {
            likes: userIdentifier,
          },
        }
      );
    }

    const updatedPhoto = await db.collection('photos').findOne({
      _id: new ObjectId(photoId),
    });

    return res.status(200).json({
      likes: updatedPhoto.likes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}