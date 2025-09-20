import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  category: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;

const Pins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: null as File | null,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pinsPerPage = 20; // ou 30
  const totalPages = Math.ceil(pins.length / pinsPerPage);

  const fetchPins = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des pins");
      setPins(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPins();
    fetch("/api/categories/")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const startEdit = (pin: Pin) => {
    setEditingId(pin.id);
    setForm({
      title: pin.title,
      price: pin.price,
      description: pin.description,
      category: pin.category,
      image: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", price: "", description: "", category: "", image: null });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (pinId: number) => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("category", form.category);
      if (form.image) formData.append("image", form.image);

      const res = await fetch(`${API_URL}${pinId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la mise à jour");
      }

      cancelEdit();
      fetchPins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce pin ?")) return;
    try {
      const res = await fetch(`${API_URL}${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchPins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleAddPin = async () => {
  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("category", form.category || "Autre");
    if (form.image) formData.append("image", form.image);

    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Erreur lors de l'ajout");
    }

    // Réinitialiser le formulaire
    setForm({ title: "", price: "", description: "", category: "", image: null });
    fetchPins();
  } catch (err) {
    alert(err instanceof Error ? err.message : "Erreur inconnue");
  }
};


  // Grouper par catégorie
  const groupedPins = pins.reduce((acc, pin) => {
    const cat = pin.category && pin.category.trim() !== "" ? pin.category : "Autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pin);
    return acc;
  }, {} as Record<string, Pin[]>);

  // Pagination: slice des pins visibles
  const paginatedPins: Record<string, Pin[]> = {};
  Object.entries(groupedPins).forEach(([cat, catPins]) => {
    const start = (currentPage - 1) * pinsPerPage;
    const end = start + pinsPerPage;
    paginatedPins[cat] = catPins.slice(start, end);
  });

  const sortedCategories = Object.keys(paginatedPins).sort((a, b) => (a === "Autre" ? 1 : b === "Autre" ? -1 : a.localeCompare(b)));

  return (
    <div className="flex flex-col items-center gap-8 p-6 w-full max-w-4xl">
      <div className="border rounded-lg shadow bg-white p-4 mb-8">
        <h2 className="text-xl font-bold text-bleu mb-2">Ajouter un nouveau pin</h2>
        <input type="text" name="title" placeholder="Titre" value={form.title} onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <input type="number" name="price" placeholder="Prix" value={form.price} onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded mb-2 w-full">
          <option value="">Autre</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="file" name="image" onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <button onClick={handleAddPin} className="bg-bleu text-white p-2 rounded">Ajouter</button>
      </div>

      {sortedCategories.map((cat) => (
        <div key={cat} className="w-full">
          <h2 className="text-2xl font-bold text-bleu mb-4">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedPins[cat].map((pin) => (
              <div key={pin.id} className="border rounded-lg shadow bg-white p-4 flex flex-col gap-2">
                <img src={pin.imageUrl} alt={pin.title} className="rounded-lg w-full h-48 object-cover" />
                {editingId === pin.id ? (
                  <>
                    <input type="text" name="title" value={form.title} onChange={handleChange} className="border p-2 rounded" />
                    <input type="number" name="price" value={form.price} onChange={handleChange} className="border p-2 rounded" />
                    <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 rounded" />
                    <select name="category" value={form.category || "Autre"} onChange={handleChange} className="border p-2 rounded">
                      <option value=""></option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <input type="file" name="image" onChange={handleChange} className="border p-2 rounded" />
                    <div className="flex gap-2">
                      <button onClick={() => handleSubmit(pin.id)} className="bg-bleu text-white p-2 rounded">Mettre à jour</button>
                      <button onClick={cancelEdit} className="bg-gray-400 text-white p-2 rounded">Annuler</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold">{pin.title}</h3>
                    <p className="text-sm">
                      {pin.description.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                    <p className="font-semibold text-blue-600">{pin.price} €</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => startEdit(pin)} className="bg-yellow-400 text-white px-3 py-1 rounded">Modifier</button>
                      <button onClick={() => handleDelete(pin.id)} className="bg-red-500 text-white px-3 py-1 rounded">Supprimer</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination controls */}
      <div className="flex gap-2 mt-4">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded">Précédent</button>
        <span className="px-3 py-1">{currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded">Suivant</button>
      </div>
    </div>
  );
};

export default Pins;
