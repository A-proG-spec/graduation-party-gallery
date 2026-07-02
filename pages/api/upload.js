import { getUserFromToken } from '../../lib/auth';
import clientPromise from '../../lib/mongodb';
import cloudinary from 'cloudinary';
import formidable from 'formidable';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const client = await clientPromise;
  const db = client.db();

  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form files' });
    }

    const file = files.image?.[0] || files.image;
    const caption = fields.caption?.[0] || fields.caption || '';

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    try {
      const uploadResult = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: 'graduation_gallery',
      });

      const newPhoto = {
        cloudinaryUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        caption,
        uploaderName: user.username,
        uploaderEmail: user.email,
        uploaderImage: user.image || null,
        likes: [],
        uploadDate: new Date(),
      };

      await db.collection('photos').insertOne(newPhoto);
      return res.status(201).json(newPhoto);
    } catch (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: 'Cloudinary or Database save error' });
    }
  });
}