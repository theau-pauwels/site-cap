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
  const totalPages = Math.ceil(pins.length / pinsPerPage);

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

// Normalisation catégorie
const normalizeCategory = (cat: string | null | undefined) => {
  if (!cat || cat.trim() === "") return "Autre";
  return cat.trim();
};

// Pagination calculée
const start = (currentPage - 1) * pinsPerPage;
const end = start + pinsPerPage;

// 👉 On trie avant pagination
const sortedPins = [...pins].sort((a, b) => {
  const catA = normalizeCategory(a.category);
  const catB = normalizeCategory(b.category);
  if (catA !== catB) return catA.localeCompare(catB); // ordre par catégorie
  return a.title.localeCompare(b.title); // et ordre alphabétique par titre
});

const paginatedPins = sortedPins.slice(start, end);

// Groupement par catégorie
const groupedPins = paginatedPins.reduce((acc, pin) => {
  const cat = normalizeCategory(pin.category);
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(pin);
  return acc;
}, {} as Record<string, Pin[]>);

const sortedCategories = Object.keys(groupedPins).sort((a, b) =>
  a === "Autre" ? 1 : b === "Autre" ? -1 : a.localeCompare(b)
);
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h1 className="text-3xl font-bold mb-4 text-bleu">Liste des Pins</h1>
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {sortedCategories.map((cat) => (
          <div key={cat}>
            <h2 className="text-2xl text-bleu font-semibold mb-4">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {groupedPins[cat].map((pin) => (
                <div
                  key={pin.id}
                  className="border rounded-lg shadow bg-white p-4 flex flex-col gap-2"
                >
                  <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    className="rounded-lg w-full h-48 object-cover"
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
                      onChange={(e) =>
                        handleQuantityChange(pin.id, parseInt(e.target.value))
                      }
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
