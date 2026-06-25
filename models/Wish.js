// models/Wish.js
import mongoose from 'mongoose';

const WishSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
    uploaderEmail: {         
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxLength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Wish || mongoose.model('Wish', WishSchema);