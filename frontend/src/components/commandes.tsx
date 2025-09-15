import React, { useEffect, useState } from "react";

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  user_nom: string;
  user_prenom: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
      } else {
        console.error("Erreur fetch orders:", res.statusText);
      }
    } catch (err) {
      console.error("Erreur fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error("Erreur update status:", err);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error("Erreur delete order:", err);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-bleu mb-4">Toutes les commandes</h1>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="border rounded p-4 bg-white shadow">
            <p><strong>Commande ID:</strong> {order.id}</p>
            <p><strong>Utilisateur:</strong> {order.user_nom} {order.user_prenom}</p>
            <p>
              <strong>Status:</strong>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="ml-2 border rounded p-1"
              >
                <option value="en attente">En attente</option>
                <option value="validée">Validée</option>
                <option value="expédiée">Expédiée</option>
                <option value="annulée">Annulée</option>
              </select>
            </p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Articles:</strong></p>
            <ul className="ml-4 list-disc">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.title} - {item.quantity} x {item.price} €
                </li>
              ))}
            </ul>
            <button
              onClick={() => deleteOrder(order.id)}
              className="mt-2 px-2 py-1 bg-red-500 text-white rounded"
            >
              Supprimer la commande
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Orders;
