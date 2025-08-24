// lib/session.ts

// ---------- Client-side only ----------
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""; // prevent use in server
  const SESSION_KEY = "fyuse_session_id";
  const SESSION_EXPIRY_KEY = "fyuse_session_expiry";
  const SESSION_TTL = 30 * 60 * 1000;

  const now = Date.now();
  const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY_KEY) || "0");

  if (!localStorage.getItem(SESSION_KEY) || now > expiry) {
    const newId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, newId);
    localStorage.setItem(SESSION_EXPIRY_KEY, (now + SESSION_TTL).toString());
    return newId;
  }

  localStorage.setItem(SESSION_EXPIRY_KEY, (now + SESSION_TTL).toString());
  return localStorage.getItem(SESSION_KEY)!;
}

// ---------- Server-side only ----------
type JwtPayload = { sub?: string };

export function getUserIdFromAuth(authHeader: string): string | undefined {
  try {
    const token = authHeader.split(" ")[1];
    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    ) as JwtPayload;
    return decoded.sub;
  } catch {
    return undefined;
  }
}

