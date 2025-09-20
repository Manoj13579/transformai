import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import { credentialsLoginVerification } from "@/config/auth/credentialsLoginVerification";
import { logEvent } from "./logEvent";


export const authOptions: NextAuthOptions = {
  providers: [
    // google login
    GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    profile(profile) {
      
    return {
      id: profile.sub, // Google ID
      name: profile.given_name + " " + profile.family_name, // full name
      email: profile.email,
      image: profile.picture,
      role: "", /* if not 1st google login will go to jwt callback. will overwrite to user from there. can pass user here but not good// this is custom written. these are not from google */
    };
  },

  }),
  // credentials login. email/password-based authentication
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // req used here just to use in logEvent
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) { 
          throw new Error("Missing email or passsword");
        }
// all logic below by own upto callbacks. customize as needed   
  try {
    const user = await credentialsLoginVerification(credentials.email, credentials.password, req);
    return user;
  } catch (error: any) {
    console.error("Login failed:", error.message);

    // logEvent for failed login
    await logEvent({
      userEmail: credentials.email,
      eventType: "Credentials Login Failed",
      level: "Warning",
      details: `Reason: ${error.message}`,
      req: req as any,
    });

    throw new Error(error.message); // forward error message to frontend
  }
      },
    }),
  ],
  
  
  callbacks: {

    // create user with google login for first time
    async signIn({ user, account }) {
  if (account?.provider === "google") {
    await connectToDatabase();
    let existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      const newUser = await User.create({
 //getting these value from above GoogleProvider
        email: user.email,
        name: user.name,
        image: user.image,
        role: "user", // default role for google signin
        isVerified: true,
      });
      user.id = (newUser._id as string).toString();
    } else {
    // id: profile.sub from above GoogleProvider will be user.id here so overwriting it with user.id.
      // Attach MongoDB _id to user id that jwt callback will receive so it can findById
      // Replace NextAuth's temporary Google id with our MongoDB _id
      user.id = (existingUser._id as string).toString();

      //  logEvent for Google login
      await logEvent({
        userId: user.id,
        userEmail: user.email!,
        eventType: "Google Login Success",
        level: "Info",
        details: `User logged in with Google`,
        req: (account as any).request, // pass request if available
      });
    }
    
  }
  return true; // Continue login
},


/* nextAuth creates jwt token and session for us returned by below callbacks that are triggered when user is signin. there are default callbacks value in nextAuth(look docs-/configuration/callbacks). if we want to return value by own need to do customization as below. in jwt we are sending user.id to token.id */

/*jwt— Runs on login and token refresh. It's where you store extra data inside the token.This data is kept server-side (in the JWT, usually in a cookie). Not visible on client*/

/* Anything you want available in session must be stored in token first. token automatically takes name, email and image. so session/user gets   name, email, image by default and other are added there. session gets all it's data from token as seen below in session.user.id = token.id as string;*/

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      const dbUser = await User.findById(user.id).select("role");
       token.role = dbUser?.role;
      }
      
      /*above user is only defined on the initial sign-in (when a user logs in)(so daabase query runs in initial sign in). On subsequent requests, user is undefined, and only token defined is passed in to below async session. so even if no user it returns token. signin for first time is checked credentials above ( async authorize(credentials)...). google login is checked by google api then only this process begins. same for session callback where session/token is passed to frontend*/
      return token;
    },
  // Make token data available to client.	Visible via useSession()
/* Flow Breakdown:
User logs in→ jwt() runs→ Stores user.id into the token (e.g., token.id = user.id)
Step 2: Frontend calls getSession() or useSession()
→ session() runs→ Takes token.id and assigns it to session.user.id.we added user.id in token.id in jwt. this is same token now session is receiving now session.user.id has user id.
 */
    async session({ session, token }) {
      if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string; 
  
      }
      // return session returns session/user
      return session;
    },
  },
  /*  signIn: "/login"- Instead of using the default NextAuth sign-in page (/api/auth/signin), redirect users to page at /login. When a user tries to access a protected route without being authenticated, they’ll be redirected to /login.
error: "/login"-If there’s an authentication error (like wrong password, OAuth failure), redirect to /login. can read error in login page using useSearchParams() or useRouter().*/
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // use jwt token for session
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/* workflow
Credential Login Flow:
User fills out email/password and clicks Login.
CredentialsProvider.authorize() is triggered.
below logic in loginVerification().
DB connection + user/password validation.
If valid → user object returned.
jwt() callback runs → adds user.id to token.
session() callback runs → adds token.id to session.user.id.
Session is available via useSession() or getSession().
all data returned by session callback now available to frontend via useSession() or getSession().

Google Login Flow:
User clicks "Continue with Google".
Redirect to Google OAuth consent screen in frontend.
After successful Google auth → Google sends back user info.
jwt() callback runs → adds user.id to token (Note: for OAuth, user.id is usually email or Google user ID).
session() callback runs → adds token.id to session.user.id.
Session is available via useSession() or getSession().
all data returned by session callback now available to frontend via useSession() or getSession().
*/