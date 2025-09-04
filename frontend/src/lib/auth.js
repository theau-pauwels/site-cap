// src/lib/auth.js
export async function getMe(cookies) {
  // Exemple : si ton backend pose un token en cookie "session"
  const session = cookies.get("session")?.value;

  if (!session) return null;

  // Ici tu appelles ton backend avec le token
  const r = await fetch("http://localhost:3000/api/me", {
    headers: { cookie: `session=${session}` },
  });

  if (!r.ok) return null;
  return await r.json(); // { role: "admin" } ou autre
}
