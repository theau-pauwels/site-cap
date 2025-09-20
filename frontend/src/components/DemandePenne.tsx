import React, { useState } from "react";

type PenneRequest = {
  couleur: string;
  liseré: string;
  broderie: string;
  tourDeTete: string;
};

const DemandePenne: React.FC = () => {
  const [form, setForm] = useState<PenneRequest>({
    couleur: "",
    liseré: "",
    broderie: "",
    tourDeTete: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Exemple : envoyer au backend (adapter URL selon ton API)
    try {
      const res = await fetch("/api/penne-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi de la demande");

      setMessage("Demande envoyée avec succès !");
      setForm({ couleur: "", liseré: "", broderie: "", tourDeTete: "" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 border rounded shadow bg-white flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-bleu mb-4">Demande de Penne</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-bleu font-semibold mb-1 block">Couleur</label>
          <input
            type="text"
            name="couleur"
            value={form.couleur}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Ex : Rouge"
            required
          />
        </div>

        <div>
          <label className="text-bleu font-semibold mb-1 block">Liseré (couleur)</label>
          <input
            type="text"
            name="liseré"
            value={form.liseré}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Ex : Doré"
          />
        </div>

        <div>
          <label className="text-bleu font-semibold mb-1 block">Broderie</label>
          <input
            type="text"
            name="broderie"
            value={form.broderie}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Ex : Nom ou initials"
          />
        </div>

        <div>
          <label className="text-bleu font-semibold mb-1 block">Tour de tête</label>
          <input
            type="text"
            name="tourDeTete"
            value={form.tourDeTete}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Ex : 56 cm"
            required
          />
        </div>

        <button type="submit" className="bg-bleu text-white p-2 rounded mt-2 hover:bg-blue-700">
          Envoyer la demande
        </button>
      </form>

      {message && <p className="text-green-600 mt-2">{message}</p>}
    </div>
  );
};

export default DemandePenne;
