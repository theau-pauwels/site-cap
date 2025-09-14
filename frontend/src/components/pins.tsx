import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;

const MemberPins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [cart, setCart] = useState<Pin[]>([]);

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

  const addToCart = (pin: Pin) => {
    const updatedCart = [...cart, pin];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${pin.title} ajouté au panier !`);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h2 className="text-2xl font-bold mb-4 text-bleu">Liste des Pins</h2>
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
            <button
              onClick={() => addToCart(pin)}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberPins;
