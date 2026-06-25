import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "../../../lib/mongodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async redirect({ url, baseUrl, token }) {
      if (token?.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const user = await db.collection("users").findOne({ email: token.email });
          // If user exists and has a password → go to gallery, else verify
          if (user && user.password) {
            return `${baseUrl}/?view=gallery`;
          } else {
            return `${baseUrl}/verify`;
          }
        } catch (error) {
          console.error("Redirect error:", error);
          return `${baseUrl}/verify`;
        }
      }
      return `${baseUrl}/?view=gallery`;
    },

    // ⭐ FETCH CUSTOM USERNAME FROM DB ON EVERY SESSION
    async session({ session, token }) {
      if (token?.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection("users").findOne({ email: token.email });
          if (dbUser) {
            session.user.username = dbUser.username;
          } else {
            // Fallback to Google name if no local user yet
            session.user.username = session.user.name;
          }
        } catch (error) {
          console.error("Session callback error:", error);
          session.user.username = session.user.name;
        }
      }
      session.user.id = token.sub;
      session.user.email = token.email;
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);