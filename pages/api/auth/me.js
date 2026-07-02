import { getUserFromToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  return res.status(200).json({
    user: {
      email: user.email,
      username: user.username,
      image: user.image || null
    }
  });
}