// pages/api/verify.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import clientPromise from "../../lib/mongodb";
import bcrypt from "bcryptjs";
import "../../styles/Verify.module.css"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 1. Check session
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { email, username, password } = req.body;

    // 2. Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const client = await clientPromise;
    const db = client.db();

    // 3. Find user
    let user = await db.collection("users").findOne({ email });

    // 4. If user exists
    if (user) {
      // 🔥 FIX: prevent crash for Google OAuth users
      if (!user.password) {
        return res.status(400).json({
          message: "This account uses Google login. No password exists.",
        });
      }

      // Validate password
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({
          message: "Invalid password for this account",
        });
      }

      // Optional: update username if needed
      if (user.username !== username) {
        await db.collection("users").updateOne(
          { email },
          { $set: { username } }
        );
      }
    } else {
      // 5. Create new local account
      const hashed = await bcrypt.hash(password, 10);

      await db.collection("users").insertOne({
        email,
        username,
        password: hashed,
        authType: "local",
        isAdmin: false,
        createdAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification completed",
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}