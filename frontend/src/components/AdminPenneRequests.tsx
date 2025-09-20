import React, { useEffect, useState } from "react";

interface PenneRequest {
  id: string;
  user_nom: string;
  user_prenom: string;
  couleur: string;
  liseré: string;
  broderie: string;
  tourDeTete: string;
  status: "en attente" | "traitée";
}

const AdminPenneRequests: React.FC = () => {
  const [requests, setRequests] = useState<PenneRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/penne-requests", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des demandes");
      const data: PenneRequest[] = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "en attente" | "traitée") => {
    try {
      const res = await fetch(`/api/admin/penne-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette demande ?")) return;
    try {
      const res = await fetch(`/api/admin/penne-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <p>Chargement des demandes...</p>;
  if (!requests.length) return <p>Aucune demande de penne pour le moment.</p>;

  return (
    <main className="p-6 max-w-4xl mx-auto flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-bleu mb-4">Demandes de Penne</h2>
      <ul className="space-y-4">
        {requests.map((req) => (
          <li key={req.id} className="border rounded shadow p-4 bg-white flex flex-col gap-2">
            <p><span className="font-semibold text-bleu">Utilisateur:</span> {req.user_nom} {req.user_prenom}</p>
            <p><span className="font-semibold text-bleu">Couleur:</span> {req.couleur}</p>
            <p><span className="font-semibold text-bleu">Liseré:</span> {req["liseré"]}</p>
            <p><span className="font-semibold text-bleu">Broderie:</span> {req.broderie}</p>
            <p><span className="font-semibold text-bleu">Tour de tête:</span> {req.tourDeTete}</p>
            <p>
              <span className="font-semibold text-bleu">Statut:</span>
              <select
                value={req.status}
                onChange={(e) => updateStatus(req.id, e.target.value as "en attente" | "traitée")}
                className="ml-2 border rounded p-1"
              >
                <option value="en attente">En attente</option>
                <option value="traitée">Traitée</option>
              </select>
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => deleteRequest(req.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer la demande
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default AdminPenneRequests;
