import { useState, useEffect } from "react";

interface UserInfo {
  nom: string;
  prenom: string;
  email: string;
  member_id: string;
  identifiant: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "" });

  useEffect(() => {
    fetch("/api/me/info")
      .then((res) => res.json())
      .then((data: UserInfo) => {
        setUser(data);
        setForm({ nom: data.nom, prenom: data.prenom, email: data.email });
      })
      .catch((err) => setError("Impossible de récupérer les informations."));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/me/info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }
      setUser({ ...user!, ...form });
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) return <p className="text-gray-500">Chargement des informations...</p>;

  return (
    <div className="max-w-xl w-full">
      <h1 className="text-3xl font-bold mb-6 text-bleu">Mon compte</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {editMode ? (
        <form className="bg-gray-100 rounded-2xl shadow p-6 mb-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="font-semibold block mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-bleu text-white px-4 py-2 rounded-lg shadow hover:bg-bleu/80 transition">
              Sauvegarder
            </button>
            <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 border rounded-lg">
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-100 rounded-2xl shadow p-6 mb-6 space-y-2">
          <p><span className="font-semibold">Nom :</span> {user.nom}</p>
          <p><span className="font-semibold">Prénom :</span> {user.prenom}</p>
          <p><span className="font-semibold">Identifiant :</span> {user.identifiant}</p>
          <p><span className="font-semibold">Email :</span> {user.email}</p>

          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-bleu text-white px-4 py-2 rounded-lg shadow hover:bg-bleu/80 transition"
          >
            Modifier
          </button>
        </div>
      )}

      <a
        href="/password"
        className="inline-block bg-bleu text-white px-4 py-2 rounded-lg shadow hover:bg-bleu/80 transition"
      >
        Changer mon mot de passe
      </a>
    </div>
  );
}
