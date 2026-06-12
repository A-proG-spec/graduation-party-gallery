// models/Photo.js
import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  // Store details of the Google user who uploaded it
  uploaderName: {
    type: String,
    required: true,
  },
  uploaderEmail: {
    type: String,
    required: true,
  },
  uploaderImage: {
    type: String,
  },
  // Array storing User IDs who liked this photo
  likes: {
    type: [String],
    default: [],
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);