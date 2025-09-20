/* ---.d.ts file can prevents the need to import declare types in every file, can use declared type globally.  the next-auth.d.ts file is used as a global type declaration, specifically for adding the types of next-auth's Session to include a user.id field. there are custom things in nextAuth we will add so type id: string; given which we will use in auth.ts 

By default, next-auth provides a Session type with a user object that includes properties like name, email, and image (from DefaultSession["user"]). However, in your authOptions, you’re adding a custom id property to the session’s user object (via the jwt and session callbacks). The declaration file ensures TypeScript recognizes this custom id property.
*/
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];/*This uses an intersection type (&) to retain all the default properties of DefaultSession["user"] (e.g., name, email, image). */
  }
}
