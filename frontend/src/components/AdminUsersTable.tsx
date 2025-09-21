// src/components/AdminUsersTable.tsx
import { useEffect, useState } from "react";

type User = {
  id: number;
  nom: string;
  prenom: string;
  identifiant?: string; // member_id ou email
  role: string;
};

const ROLE_OPTIONS = ["member","admin"];

export default function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ nom: string; prenom: string; identifiant: string }>({ nom: "", prenom: "", identifiant: "" });

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users", { credentials: "include" });
    if (!res.ok) throw new Error("Impossible de charger les utilisateurs");
    const data: User[] = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, []);

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

  const deleteUser = async (userId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) { alert("Erreur lors de la suppression de l'utilisateur"); return; }
    await fetchUsers();
  };

  const saveUser = async (userId: number) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editValues),
    });
    if (!res.ok) { alert("Erreur lors de la modification"); return; }
    setEditingUserId(null);
    await fetchUsers();
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr>
          <th className="border px-2 py-1">Nom</th>
          <th className="border px-2 py-1">Prénom</th>
          <th className="border px-2 py-1">Identifiant</th>
          <th className="border px-2 py-1">Rôle</th>
          <th className="border px-2 py-1">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td className="border px-2 py-1">
              {editingUserId === u.id ? (
                <input
                  value={editValues.nom}
                  onChange={e => setEditValues(prev => ({ ...prev, nom: e.target.value }))}
                  className="border p-1 rounded"
                />
              ) : u.nom}
            </td>
            <td className="border px-2 py-1">
              {editingUserId === u.id ? (
                <input
                  value={editValues.prenom}
                  onChange={e => setEditValues(prev => ({ ...prev, prenom: e.target.value }))}
                  className="border p-1 rounded"
                />
              ) : u.prenom}
            </td>
            <td className="border px-2 py-1">
              {editingUserId === u.id ? (
                <input
                  value={editValues.identifiant}
                  onChange={e => setEditValues(prev => ({ ...prev, identifiant: e.target.value }))}
                  className="border p-1 rounded"
                />
              ) : u.identifiant ?? ""}
            </td>
            <td className="border px-2 py-1">
              <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}>
                {ROLE_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </td>
            <td className="border px-2 py-1 flex gap-1">
              {editingUserId === u.id ? (
                <>
                  <button onClick={()=>saveUser(u.id)} className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">💾</button>
                  <button onClick={()=>setEditingUserId(null)} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500">✖</button>
                </>
              ) : (
                <>
                  <button onClick={()=>{setEditingUserId(u.id); setEditValues({nom:u.nom, prenom:u.prenom, identifiant:u.identifiant ?? ""})}} className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600">✏️</button>
                  <button onClick={()=>deleteUser(u.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">🗑</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
