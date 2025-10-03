import React, { useEffect, useState } from "react";

interface PenneRequest {
  id: number;
  couleur: string;
  liseré: string;
  broderie: string;
  tourDeTete: string;
  status: "en attente" | "traitée";
}

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface UserOrder {
  id: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface CustomPinRequest {
  id: number;
  title: string;
  quantity: number;
  notes: string;
  logoUrl: string;
  status: "en attente" | "validée" | "refusée";
  created_at: string;
}

const MyOrders: React.FC = () => {
  const [pennes, setPennes] = useState<PenneRequest[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [customPins, setCustomPins] = useState<CustomPinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const resOrders = await fetch("/api/orders", { credentials: "include" });
      const dataOrders: UserOrder[] = resOrders.ok ? await resOrders.json() : [];
      setOrders(dataOrders);

      const resPennes = await fetch("/api/penne-requests/", { credentials: "include" });
      const dataPennes: PenneRequest[] = resPennes.ok ? await resPennes.json() : [];
      setPennes(dataPennes);

      const resCustomPins = await fetch("/api/pins/requests/", { credentials: "include" });
      const dataCustomPins: CustomPinRequest[] = resCustomPins.ok ? await resCustomPins.json() : [];
      setCustomPins(dataCustomPins);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Chargement des commandes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <main className="p-4 max-w-4xl mx-auto flex flex-col gap-6">

      {/* Commandes de penne */}
      <section>
        <h2 className="text-xl font-bold text-bleu mb-2">Mes demandes de penne</h2>
        {pennes.length === 0 ? (
          <p>Aucune demande de penne.</p>
        ) : (
          <ul className="space-y-4">
            {pennes.map((p) => (
              <li key={p.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
                <p><strong>Couleur:</strong> {p.couleur}</p>
                <p><strong>Liseré:</strong> {p.liseré}</p>
                <p><strong>Broderie:</strong> {p.broderie}</p>
                <p><strong>Tour de tête:</strong> {p.tourDeTete}</p>
                <p><strong>Statut:</strong> {p.status}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Commandes de pins classiques */}
      <section>
        <h2 className="text-xl font-bold text-bleu mb-2">Mes commandes d'articles</h2>
        {orders.length === 0 ? (
          <p>Aucune commande d'articles.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
                <p><strong>Statut:</strong> {order.status}</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Articles:</strong></p>
                <ul className="ml-4 list-disc">
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item.title} - {item.quantity} x {item.price} €</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Commandes de pins personnalisés */}
      <section>
        <h2 className="text-xl font-bold text-bleu mb-2">Mes commandes de pins personnalisés</h2>
        {customPins.length === 0 ? (
          <p>Aucune commande personnalisée.</p>
        ) : (
          <ul className="space-y-4">
            {customPins.map((p) => (
              <li key={p.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
                <p><strong>Titre:</strong> {p.title}</p>
                <p><strong>Quantité:</strong> {p.quantity}</p>
                <p><strong>Notes:</strong> {p.notes || "—"}</p>
                <p><strong>Statut:</strong> {p.status}</p>
                <p><strong>Date:</strong> {new Date(p.created_at).toLocaleString()}</p>
                <img src={p.logoUrl} alt={p.title} className="w-32 h-32 object-contain mt-2 border" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default MyOrders;
