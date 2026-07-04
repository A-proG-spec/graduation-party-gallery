import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();

    if (req.method === 'GET') {
      const { uploaderEmail } = req.query;
      const filter = uploaderEmail ? { uploaderEmail } : {};

      // Use aggregation to add commentCount
      const photos = await db.collection('photos')
        .aggregate([
          { $match: filter },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'photoId',
              as: 'comments'
            }
          },
          {
            $addFields: {
              commentCount: { $size: '$comments' }
            }
          },
          {
            $project: {
              comments: 0 // remove the comments array
            }
          },
          { $sort: { uploadDate: -1 } }
        ])
        .toArray();

      return res.status(200).json(photos);
    }

    if (req.method === 'POST') {
      return res.status(200).json({ message: 'Use /api/upload for photo uploads' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}