import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  category: string;
};

type CartItem = Pin & { quantity: number };

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;

const MemberPins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const pinsPerPage = 20;

  const fetchPins = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des pins");
      const data = await res.json();
      setPins(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPins();
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  const handleQuantityChange = (pinId: number, qty: number) => {
    setQuantities((prev) => ({ ...prev, [pinId]: qty }));
  };

  const addToCart = (pin: Pin) => {
    const qty = quantities[pin.id] || 1;
    const updatedCart = [...cart, { ...pin, quantity: qty }];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${pin.title} ajouté au panier x${qty} !`);
  };

  // Grouper les pins par catégorie
  const groupedPins = pins.reduce((acc, pin) => {
    const cat = pin.category || "Autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pin);
    return acc;
  }, {} as Record<string, Pin[]>);

  const sortedCategories = Object.keys(groupedPins).sort((a, b) => {
    if (a === "Autre") return 1;
    if (b === "Autre") return -1;
    return a.localeCompare(b);
  });

  const paginatedPins: Record<string, Pin[]> = {};
  sortedCategories.forEach((cat) => {
    const start = (currentPage - 1) * pinsPerPage;
    const end = start + pinsPerPage;
    paginatedPins[cat] = groupedPins[cat].slice(start, end);
  });

  const totalPages = Math.ceil(pins.length / pinsPerPage);

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h2 className="text-2xl font-bold mb-4 text-bleu">Liste des Pins</h2>
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {sortedCategories.map((cat) => (
          <div key={cat}>
            <h3 className="text-xl font-semibold mb-4">{cat}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {paginatedPins[cat].map((pin) => (
              <div key={pin.id} className="border rounded-lg shadow bg-white p-4 flex flex-col gap-2">
                <img
                  src={pin.imageUrl}
                  alt={pin.title}
                  className="rounded-lg w-full h-48 object-cover" // plus haute que h-48
                />
                <h4 className="text-lg font-bold">{pin.title}</h4>
                <p className="text-sm">{pin.description}</p>
                <p className="font-semibold text-blue-600">{pin.price} €</p>

                <div className="flex gap-2 items-center">
                  <label className="text-sm">Quantité :</label>
                  <input
                    type="number"
                    min={1}
                    value={quantities[pin.id] || 1}
                    onChange={(e) => handleQuantityChange(pin.id, parseInt(e.target.value))}
                    className="border p-1 rounded w-16"
                  />
                </div>

                <button
                  onClick={() => addToCart(pin)}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Ajouter au panier
                </button>
              </div>

              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded"
        >
          Précédent
        </button>
        <span className="px-3 py-1">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default MemberPins;
