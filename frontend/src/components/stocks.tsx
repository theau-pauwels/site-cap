import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  stock: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;

const AdminPins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState<Record<number, number>>({});

  const fetchPins = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des pins");
      const data = await res.json();
      setPins(data);

      // Initialiser les inputs de stock
      const initialStocks: Record<number, number> = {};
      data.forEach((pin) => {
        initialStocks[pin.id] = pin.stock;
      });
      setStockInputs(initialStocks);
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

      // Mettre à jour localement pour éviter un re-fetch complet
      setPins((prev) =>
        prev.map((pin) =>
          pin.id === pinId ? { ...pin, stock: newStock } : pin
        )
      );
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
            <p className="text-sm">Stock disponible : {pin.stock}</p>
            <label className="mt-2 text-sm flex items-center gap-2">
              Stock :
              <input
                type="number"
                value={stockInputs[pin.id] ?? ""}
                min={0}
                placeholder={String(pin.stock)}
                onChange={(e) =>
                  setStockInputs((inputs) => ({
                    ...inputs,
                    [pin.id]: e.target.value,
                  }))
                }
                className="border rounded px-2 py-1 w-20"
              />
              <button
                onClick={() =>
                  updateStock(
                    pin.id,
                    stockInputs[pin.id] === "" ? pin.stock : Number(stockInputs[pin.id])
                  )
                }
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                disabled={stockInputs[pin.id] === "" || Number(stockInputs[pin.id]) === pin.stock}
              >
                Valider
              </button>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPins;
