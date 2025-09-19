import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
};

// Base URL pour l'API, configurable en dev ou prod
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`; // <-- pas de slash final

const Pins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Récupérer les pins
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
  }, []);

  // Ajouter / modifier un pin
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price);
      formData.append("description", description);
      if (image) formData.append("image", image);

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de l'enregistrement");
      }

      setTitle("");
      setPrice("");
      setDescription("");
      setImage(null);
      setEditingId(null);
      fetchPins();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Supprimer un pin
  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce pin ?")) return;
    try {
      const res = await fetch(`${API_URL}${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la suppression");
      }
      fetchPins();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Préparer la modification
  const handleEdit = (pin: Pin) => {
    setEditingId(pin.id);
    setTitle(pin.title);
    setPrice(pin.price);
    setDescription(pin.description);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6">
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 border rounded-xl shadow-md w-full max-w-md bg-white"
    >
      <h2 className="text-xl text-bleu font-bold">
        {editingId ? "Modifier un Pin" : "Ajouter un Pin"}
      </h2>

      <input
        type="text"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        placeholder="Prix"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="border p-2 rounded"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-bleu text-white rounded p-2 hover:bg-blue-600"
        >
          {editingId ? "Mettre à jour" : "Ajouter"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setTitle("");
              setPrice("");
              setDescription("");
              setImage(null);
            }}
            className="bg-gray-400 text-white rounded p-2 hover:bg-gray-500"
          >
            Annuler
          </button>
        )}
      </div>
    </form>

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
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(pin)}
                className="bg-yellow-400 text-white px-3 py-1 rounded"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(pin.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pins;
