import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/requests/`;

const CustomPinRequest: React.FC = () => {
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !logo) {
      setError("Merci de renseigner un titre et d'ajouter un logo.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("quantity", String(quantity));
      formData.append("notes", notes);
      formData.append("logo", logo);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l’envoi de la demande");
      }

      setTitle("");
      setQuantity(1);
      setNotes("");
      setLogo(null);
      setSuccess("Votre demande a bien été envoyée !");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 border rounded-xl shadow-md w-full max-w-md bg-white"
      >
        <h2 className="text-xl font-bold text-bleu">Demande de Pin personnalisé</h2>

        <input
          type="text"
          placeholder="Titre du pin"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="number"
          placeholder="Quantité"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min={1}
          className="border p-2 rounded"
          required
        />

        <textarea
          placeholder="Notes (facultatif)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files?.[0] || null)}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="bg-green-500 text-white rounded p-2 hover:bg-green-600"
        >
          Envoyer
        </button>

        {success && <p className="text-green-600">{success}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default CustomPinRequest;
