//middleware.ts is Nextjs specific file so name must be middleware.ts. just using here for nextAuth middleware
// this NextAuth.js authMiddleware used to protect routes and manage user sessions.
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/* this middleware works with return true or return false. return true means allow to go to the route.  return token?.role === "admin"; means if token is there and role is admin return true.*/
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        // paths that don't require authentication. pathname others than these will require authentication
        if (
          /*pathname.startsWith("/api/auth") is specifically for allowing Next.js API requests (like login/session routes) to proceed without requiring authentication in your middleware.[...nextauth] and all routes that start with /api/auth need to be unrestricted. this middleware can also protect backend routes but we still use getServerSession() or getToken() for better security and also to get data like token.userId, token.role etc.*/
          pathname.startsWith("/api/auth") ||
          pathname === "/api/webhooks/stripe" ||
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/forgot-password" ||
          pathname === "/forgot-password/forgot-password-verification" ||
          pathname.startsWith("/register/register-verification")//pathname.startsWith for dynamic route(here) n routes with same parent.
              )
          return true;

        // Admin-only route. return true if token?.role === "admin
        if (pathname.startsWith("/admindashboard")) {
          return token?.role === "admin";
        }

        // if (token) { return true;} else {return false;}. require authentication/token
        // The token here is the JWT token decoded by NextAuth from the user’s session cookie. passed from session callback in auth.ts
        /* If token exists → !!token is true.If token is undefined or null → !!token is false. so return true if token exists, false if not.

For all other routes (that aren’t public), require the user to be authenticated. If token exists (i.e., the user is logged in), allow access. Otherwise, block access. You're not returning the token itself — you're returning a boolean (true or false) to tell NextAuth:
true → allow access.false → block access (redirect to login or show 403)
So, return !!token does not return the token to the browser — it just returns a boolean to control access to the page.
*/
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
    -invoke this auth middleware for all request paths except:
    - Skip Next.js internals and all static files, unless found in search params
    - _next/static (static files)
    - _next/image (image optimization files)
    - favicon.ico (favicon file)
    - public folder
     -etc.
 */

    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
