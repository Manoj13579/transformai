/* To add NextAuth.js to a project create a file in [...nextauth] in api/auth. This contains the dynamic route handler for NextAuth.js which will also contain all of your global NextAuth.js configurations. All requests after /api/auth/ (and route function inside  [...nextauth] folder( register is not inside this so independent))like (/callbacks/credentials for login(this in authOptions)) will automatically be handled by this file because of [...nextauth], this structure are used coz nextAuth.js makes us to do it. if want to capture single dynamic value use eg. [id], if want to capture multiple dynamic values use eg. [...nextauth] this will capture multiple segments of this UR route. inbuilt signIn from nextAuth.js etc. will use this route in [...nextauth]*/

import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };