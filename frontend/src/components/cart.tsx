import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
};

const Cart: React.FC = () => {
  const [cart, setCart] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  const removeFromCart = (id: number) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const checkout = async () => {
    if (!cart.length) return;
    setLoading(true);
    setMessage("");

    const items = cart.map((item) => ({
      id: item.id,
      title: item.title,
      price: parseFloat(item.price),
      quantity: 1, // ou stocker la quantité si nécessaire
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const j = await res.json();
        setMessage(j.error || `Erreur ${res.status}`);
      } else {
        setMessage("Commande envoyée avec succès !");
        setCart([]);
        localStorage.removeItem("cart");
      }
    } catch (err) {
      setMessage("Erreur réseau lors de la commande.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return <p>Votre panier est vide.</p>;

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold mb-4 text-bleu">Votre Panier</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {cart.map((item) => (
          <div key={item.id} className="border rounded-lg shadow bg-white p-4 flex flex-col gap-2">
            <img src={item.imageUrl} alt={item.title} className="rounded-lg w-full h-48 object-cover" />
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="text-sm">{item.description}</p>
            <p className="font-semibold text-blue-600">{item.price} €</p>
            <button
              onClick={() => removeFromCart(item.id)}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <p className="text-xl font-bold mt-4">Total: {total.toFixed(2)} €</p>
      <button
        onClick={checkout}
        disabled={loading}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {loading ? "Envoi..." : "Passer la commande"}
      </button>
      {message && <p className="mt-2 text-red-600">{message}</p>}
    </div>
  );
};

export default Cart;
