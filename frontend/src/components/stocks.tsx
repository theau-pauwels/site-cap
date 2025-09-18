import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  stock: number; // ✅ nouvelle propriété
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;

const AdminPins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPins = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des pins");
      const data = await res.json();
      setPins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const updateStock = async (pinId: number, newStock: number) => {
    try {
      const res = await fetch(`${API_URL}${pinId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour du stock");
      await fetchPins(); // refresh
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour le stock");
    }   
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h2 className="text-2xl font-bold mb-4 text-bleu">Gestion des Stocks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="border rounded-lg shadow bg-white p-4 flex flex-col gap-2"
          >
            <img
              src={pin.imageUrl}
              alt={pin.title}
              className="rounded-lg w-full h-48 object-cover"
            />
            <h3 className="text-lg font-bold">{pin.title}</h3>
            <p className="text-sm">{pin.description}</p>
            <p className="font-semibold text-blue-600">{pin.price} €</p>

            <label className="mt-2 text-sm">
              Stock disponible :
              <input
                type="number"
                value={pin.stock}
                min={0}
                onChange={(e) =>
                  updateStock(pin.id, parseInt(e.target.value, 10))
                }
                className="ml-2 border rounded px-2 py-1 w-20"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPins;
