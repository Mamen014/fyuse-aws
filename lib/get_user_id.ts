import { jwtDecode } from "jwt-decode";

export function getUserIdFromRequest(req: Request | { headers: Headers }): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    return decoded.sub || null;
  } catch (err) {
    console.error("Invalid JWT token:", err);
    return null;
  }
}
