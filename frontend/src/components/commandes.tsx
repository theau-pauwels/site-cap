import React, { useEffect, useState } from "react";

interface OrderItem {
  pin_id: number;
  title: string;
  price: number;
  quantity: number;
  currentStock: number;
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
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur fetch orders");

      const dataOrders: Order[] = await res.json();
      setOrders(
        dataOrders.map((order) => ({
          ...order,
          items: order.items.map((item) => ({
            ...item,
            currentStock: item.currentStock ?? 0,
          })),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === newStatus) return;

    try {
      setUpdatingStatusId(orderId);

      // ✅ On update le statut côté API
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const payload = await res.json();
      if (!res.ok) {
        alert(payload.error || "Impossible de mettre à jour le statut");
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: payload.status,
                items: payload.items.map((item: OrderItem) => ({
                  ...item,
                  currentStock: item.currentStock ?? 0,
                })),
              }
            : o
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatusId(null);
    }
  };




  const deleteOrder = async (orderId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette commande ?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <p className="text-center text-gray-500">Chargement des commandes...</p>;

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold text-bleu mb-4">Toutes les commandes</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">Aucune commande pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.id} className="border rounded p-4 bg-white shadow">
              <p><strong>Commande ID:</strong> {order.id}</p>
              <p><strong>Utilisateur:</strong> {order.user_nom} {order.user_prenom}</p>
              <p>
                <strong>Status:</strong>
                <select
                  value={order.status}
                  onChange={e => updateStatus(order.id, e.target.value)}
                  className="ml-2 border rounded p-1"
                  disabled={updatingStatusId === order.id}
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
                    {item.title} - {item.quantity} x {item.price} € (Stock actuel: {item.currentStock})
                  </li>
                ))}
              </ul>
              <button
                onClick={() => deleteOrder(order.id)}
                className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer la commande
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Orders;
