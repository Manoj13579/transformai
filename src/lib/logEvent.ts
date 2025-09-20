import Log from "@/models/Log";
import { connectToDatabase } from "./db";
import { getClientIpBrowser } from "./getClientIpBrowser";

export async function logEvent({
  userId,
  userEmail,
  eventType,
  level = "Info",
  details,
  req,
}: {
  userId?: string;
  userEmail?: string;
  eventType: string;
  level?: "Info" | "Warning" | "Error" | "Debug";
  details?: string;
  req?: Request | { headers: Headers };// could be Request or { headers: Headers }
}) {
  try {
    await connectToDatabase();

    let ip: string | undefined;
    let browser: string | undefined;

    if (req) {
      // defined const headers as below coz- works for both NextAuth and Next.js APIs with one approach.
      /* In Next.js route handlers → req is a NextRequest → req.headers is a Headers object (has .get() method).In NextAuth’s authorize function→ req is a RequestInternal → req.headers is a plain JS object (no .get()). This line normalizes headers: If req.headers already supports .get() (so it’s a Headers object) → use as-is.
 */
/* checking what kind of req.headers is being passed in. "Is this already a Request? Or at least something that has a .get() method (like a real Headers object)?". If yes → Use it as is: req.headers. If no → Convert it to the right format: new Headers(req.headers) */

      const headers =
        req instanceof Request || typeof (req as any).headers?.get === "function"
          ? (req as Request).headers
          : new Headers((req as any).headers);
/* changing ip to clientIp just to make it clear that this ip we are getting from getClientIpBrowser(headers). can write const { ip, browser } = getClientIpBrowser(headers); too coz we are declaring them first with let not const as let ip: string | undefined; */
      const { ip: clientIp, browser: clientBrowser } = getClientIpBrowser(headers);
      ip = clientIp;
      browser = clientBrowser;
    }

    await Log.create({
      userId,
      userEmail,
      eventType,
      level,
      details,
      ip,
      browser,
    });
  } catch (error) {
    console.error("Error in logEvent", error);
  }
}
