import React, { useEffect, useState } from "react";

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { credentials: "include" });
        if (res.ok) {
          const data: Order[] = await res.json();
          setOrders(data);
        } else if (res.status === 401) {
          setError("Non autorisé. Veuillez vous connecter.");
        } else {
          setError("Erreur lors de la récupération des commandes.");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur réseau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Chargement des commandes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-bleu mb-4">Mes commandes</h1>
      {orders.length === 0 ? (
        <p>Aucune commande trouvée.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border rounded p-4 bg-white shadow">
              <p><strong>Commande ID:</strong> {order.id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Articles:</strong></p>
              <ul className="ml-4 list-disc">
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.title} - {item.quantity} x {item.price} €
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default MyOrders;
