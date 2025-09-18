import React, { useEffect, useState } from "react";

type Request = {
  id: number;
  title: string;
  quantity: number;
  notes: string;
  logoUrl: string;
  status: string; // ex: "en attente" | "validée" | "refusée"
  user_email?: string; // optionnel si tu stockes qui a fait la demande
  created_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/requests`;

const AdminCustomPinRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des demandes");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
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

  const deleteRequest = async (id: number) => {
    if (!confirm("Supprimer cette demande ?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-bleu mb-4">Demandes de Pins personnalisés</h1>
      <ul className="space-y-4">
        {requests.map((req) => (
          <li key={req.id} className="border rounded p-4 bg-white shadow">
            <p><strong>Titre :</strong> {req.title}</p>
            <p><strong>Quantité :</strong> {req.quantity}</p>
            <p><strong>Notes :</strong> {req.notes || "—"}</p>
            <p><strong>Date :</strong> {new Date(req.created_at).toLocaleString()}</p>
            {req.user_email && <p><strong>Utilisateur :</strong> {req.user_email}</p>}
            <img src={req.logoUrl} alt="logo" className="w-32 h-32 object-contain mt-2 border" />

            <div className="mt-2 flex items-center gap-2">
              <label>
                <span className="mr-2">Statut :</span>
                <select
                  value={req.status}
                  onChange={(e) => updateStatus(req.id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="en attente">En attente</option>
                  <option value="validée">Validée</option>
                  <option value="refusée">Refusée</option>
                </select>
              </label>
              <button
                onClick={() => deleteRequest(req.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default AdminCustomPinRequests;
