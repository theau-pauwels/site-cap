import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  category: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;

const AdminPrix: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const fetchPins = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des pins");
      setPins(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const startEdit = (pin: Pin) => {
    setEditingId(pin.id);
    setNewPrice(pin.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewPrice("");
  };

  const handlePriceChange = async (pinId: number) => {
    if (!newPrice || isNaN(Number(newPrice))) {
      alert("Veuillez entrer un prix valide");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("price", newPrice);

      const res = await fetch(`${API_URL}${pinId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la mise à jour du prix");
      }

      cancelEdit();
      fetchPins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-4xl">
      <h1 className="text-2xl font-bold text-bleu mb-4">Admin Prix - Modifier uniquement les prix</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {pins.map((pin) => (
          <div key={pin.id} className="border rounded-lg shadow bg-white p-4 flex flex-col gap-2">
            <img src={pin.imageUrl} alt={pin.title} className="rounded-lg w-full h-48 object-cover" />
            <h3 className="text-lg font-bold text-bleu">{pin.title}</h3>
            <p className="text-sm text-bleu">{pin.description}</p>
            {editingId === pin.id ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="border p-2 rounded w-24"
                />
                <button
                  onClick={() => handlePriceChange(pin.id)}
                  className="bg-bleu text-white px-3 py-1 rounded"
                >
                  Enregistrer
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-2 items-center">
                <span className="font-semibold text-bleu">{pin.price} €</span>
                <button
                  onClick={() => startEdit(pin)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded"
                >
                  Modifier le prix
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPrix;
