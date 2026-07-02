import clientPromise from "../../lib/mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const client = await clientPromise;
    const db = client.db("graduation");

    const users = db.collection("users");

    // check username
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username taken" });
    }

    // check email
    const existingEmail = await users.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return res.status(200).json({ message: "User verified & saved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}