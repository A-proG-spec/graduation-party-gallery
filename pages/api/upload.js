import { IncomingForm } from 'formidable';
import cloudinary from '../../lib/cloudinary';
import clientPromise from '../../lib/mongodb';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the incoming form data
    const form = new IncomingForm();
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const uploaderName = fields.uploaderName[0];
    const imageFile = files.image[0];

    if (!uploaderName || !imageFile) {
      return res.status(400).json({ error: 'Missing uploader name or image' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.filepath, {
      folder: 'graduation_party',
    });

    // Delete temporary file
    fs.unlinkSync(imageFile.filepath);

    // Save to MongoDB
    const client = await clientPromise;
    const db = client.db('graduation_party_gallery');
    
    const photoDoc = {
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      uploaderName: uploaderName,
      uploadDate: new Date(),
      originalFilename: imageFile.originalFilename || '',
    };

    const result_db = await db.collection('photos').insertOne(photoDoc);

    res.status(200).json({
      success: true,
      photo: {
        id: result_db.insertedId,
        ...photoDoc,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
}