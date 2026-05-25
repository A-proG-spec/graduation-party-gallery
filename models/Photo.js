// This is just a reference schema - MongoDB doesn't require strict schemas
// But this helps you understand the structure

const PhotoSchema = {
  cloudinaryUrl: String,      // required
  cloudinaryPublicId: String, // required
  uploaderName: String,       // required
  uploadDate: Date,           // default: now
  originalFilename: String,   // optional
};

export default PhotoSchema;