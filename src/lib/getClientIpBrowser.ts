export function getClientIpBrowser(headers: Headers) {
  // IP (check proxies, fall back to unknown)
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "Unknown IP";

  // Browser (from User-Agent)
  const userAgent = headers.get("user-agent") || "Unknown";
  let browser = "Unknown";

  if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) browser = "Chrome";
  else if (/Firefox/.test(userAgent)) browser = "Firefox";
  else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) browser = "Safari";
  else if (/Edg/.test(userAgent)) browser = "Edge";

  return { ip, browser };
}