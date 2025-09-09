// src/components/AdminUsersTable.tsx
import { useEffect, useState } from "react";

type Memberships = Record<string, string>; // { "2024": "A-12" }

type User = {
  id: number;
  nom: string;
  prenom: string;
  identifiant?: string;
  cartes?: Memberships;
  role: string;
};

const ALLOWED_PREFIXES = ["A","F","E","EA","MI","S"];
const ROLE_OPTIONS = ["member","verifier","admin"];

function currentAcademicStartYear() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return m >= 8 ? y : y - 1;
}

function makeYearRanges(countBefore = 2, countAfter = 6) {
  const start = currentAcademicStartYear();
  return Array.from({ length: countAfter + countBefore + 1 }, (_, k) => {
    const y = start - countBefore + k;
    return `${y}-${y + 1}`;
  });
}

function startYearFromLabel(label: string) {
  const left = label.split("-")[0];
  const n = parseInt(left, 10);
  return Number.isFinite(n) ? n : null;
}

export default function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------- API ----------
  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users", { credentials: "include" });
    if (!res.ok) throw new Error("Impossible de charger les utilisateurs");
    const data: User[] = await res.json();
    setUsers(data);
  };

  const ensureAdmin = async (): Promise<boolean> => {
    const res = await fetch("/api/me", { credentials: "include" });
    if (!res.ok) { window.location.href = "/login"; return false; }
    const me = await res.json();
    if (me.role !== "admin") { window.location.href = "/"; return false; }
    return true;
  };

  // ---------- Effet initial ----------
  useEffect(() => {
    (async () => {
      if (!(await ensureAdmin())) return;
      await fetchUsers();
      setLoading(false);
    })();
  }, []);

  // ---------- Gestion des cartes ----------
  const addCard = async (userId: number, annee: string, prefix: string, num: number) => {
    const annee_code = `${prefix}-${num}`;
    const res = await fetch(`/api/admin/users/${userId}/annees`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ annee, annee_code }),
    });
    if (!res.ok) { alert("Erreur lors de l'ajout de la carte"); return; }
    await fetchUsers();
  };

  const removeCard = async (userId: number, annee: string) => {
    if (!confirm(`Supprimer la carte pour ${annee} ?`)) return;
    const res = await fetch(`/api/admin/users/${userId}/annees/${annee}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) { alert("Erreur lors de la suppression"); return; }
    await fetchUsers();
  };

  // ---------- Changement de rôle ----------
  const changeRole = async (userId: number, role: string) => {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    if (!res.ok) { alert("Erreur lors du changement de rôle"); return; }
    await fetchUsers();
  };

  // ---------- Rendu ----------
  if (loading) return <p>Chargement...</p>;

  const yearRanges = makeYearRanges();

  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr>
          <th className="border px-2 py-1">Nom</th>
          <th className="border px-2 py-1">Prénom</th>
          <th className="border px-2 py-1">Identifiant</th>
          <th className="border px-2 py-1">Cartes</th>
          <th className="border px-2 py-1">Ajouter une carte</th>
          <th className="border px-2 py-1">Rôle</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td className="border px-2 py-1">{u.nom}</td>
            <td className="border px-2 py-1">{u.prenom}</td>
            <td className="border px-2 py-1">{u.identifiant ?? ""}</td>
            <td className="border px-2 py-1">
              {u.cartes && Object.entries(u.cartes).length > 0
                ? Object.entries(u.cartes)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([annee, code]) => (
                      <div key={annee}>
                        {annee} → {code}{" "}
                        <button
                          className="text-red-600"
                          onClick={() => removeCard(u.id, annee)}
                        >
                          🗑
                        </button>
                      </div>
                    ))
                : <span className="text-gray-400">—</span>
              }
            </td>
            <td className="border px-2 py-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  const annee = (f.annee as HTMLSelectElement).value;
                  const prefix = (f.prefix as HTMLSelectElement).value;
                  const num = parseInt((f.num as HTMLInputElement).value, 10);
                  addCard(u.id, annee, prefix, num);
                }}
                className="flex flex-col gap-1"
              >
                <select name="annee" required>
                  {yearRanges.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select name="prefix" required>
                  {ALLOWED_PREFIXES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input name="num" type="number" min={1} placeholder="Numéro" required />
                <button type="submit" className="bg-blue-900 text-white px-2 py-1 rounded">➕</button>
              </form>
            </td>
            <td className="border px-2 py-1">
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value)}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
