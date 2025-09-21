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
    category: "Autre",
    image: null as File | null,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const pinsPerPage = 20;
  const [categorySearch, setCategorySearch] = useState("");

  /** Charger les pins et catégories */
  const fetchPins = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des pins");
      const data = await res.json();
      setPins(data);

      // Extraire toutes les catégories uniques
      const uniqueCategories = Array.from(new Set(data.map((p: Pin) => normalizeCategory(p.category))));
      setCategories(uniqueCategories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

useEffect(() => {
  setPageInput(String(currentPage));
}, [currentPage]);

  /** Normalisation catégorie */
  const normalizeCategory = (cat: string | null | undefined) => {
    if (!cat || cat.trim() === "") return "Autre";
    return cat.trim();
  };

  /** Filtrage par catégorie */
  const filteredPins = categorySearch
    ? pins.filter((pin) => normalizeCategory(pin.category) === categorySearch)
    : pins;

  /** Tri par catégorie puis titre */
  const sortedPins = [...filteredPins].sort((a, b) => {
    const catA = normalizeCategory(a.category);
    const catB = normalizeCategory(b.category);
    if (catA !== catB) return catA.localeCompare(catB);
    return a.title.localeCompare(b.title);
  });

  // Pagination calculée
  const start = (currentPage - 1) * pinsPerPage;
  const end = start + pinsPerPage;
  const paginatedPins = sortedPins.slice(start, end);

  // Groupement par catégorie
  const groupedPins = paginatedPins.reduce((acc, pin) => {
    const cat = normalizeCategory(pin.category);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pin);
    return acc;
  }, {} as Record<string, Pin[]>);

  const sortedCategories = Object.keys(groupedPins).sort((a, b) =>
    a === "Autre" ? 1 : b === "Autre" ? -1 : a.localeCompare(b)
  );

  const totalPages = Math.ceil(sortedPins.length / pinsPerPage);

  /** Handlers CRUD et Form */
  const startEdit = (pin: Pin) => {
    setEditingId(pin.id);
    setForm({
      title: pin.title,
      price: pin.price,
      description: pin.description,
      category: pin.category || "Autre",
      image: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", price: "", description: "", category: "Autre", image: null });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
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

      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      setForm({ title: "", price: "", description: "", category: "Autre", image: null });
      fetchPins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleSubmit = async (pinId: number) => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("category", form.category || "Autre");
      if (form.image) formData.append("image", form.image);

      const res = await fetch(`${API_URL}${pinId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
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



  return (
    <div className="flex flex-col items-center gap-8 p-6 w-full max-w-4xl">

      {/* Ajout d’un pin */}
      <div className="border rounded-lg shadow bg-white p-4 mb-8 w-full">
        <h2 className="text-xl font-bold text-bleu mb-2">Ajouter un nouveau pin</h2>
        <input
          type="text"
          name="title"
          placeholder="Titre"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded mb-2 w-full"
        />
        <input
          type="number"
          name="price"
          placeholder="Prix"
          value={form.price}
          onChange={handleChange}
          className="border p-2 rounded mb-2 w-full"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded mb-2 w-full"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded mb-2 w-full"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="Autre">Autre</option>
        </select>
        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="border p-2 rounded mb-2 w-full"
        />
        <button onClick={handleAddPin} className="bg-bleu text-white p-2 rounded w-full">
          Ajouter
        </button>
      </div>

      {/* Recherche par catégorie */}
      <select
        value={categorySearch}
        onChange={(e) => {
          setCategorySearch(e.target.value);
          setCurrentPage(1); // reset pagination
        }}
        className="border p-2 rounded w-full max-w-md mb-4"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
        <option value="Autre">Autre</option>
      </select>
      {/* Liste des pins groupés */}
      {sortedCategories.map((cat) => (
        <div key={cat} className="w-full">
          <h2 className="text-2xl font-bold text-bleu mb-4">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedPins[cat].map((pin) => (
              <div key={pin.id} className="border rounded-lg shadow bg-white p-4 flex flex-col gap-2">
                <img src={pin.imageUrl} alt={pin.title} className="rounded-lg w-full h-48 object-cover" />
                {editingId === pin.id ? (
                  <>
                    <input type="text" name="title" value={form.title} onChange={handleChange} className="border p-2 rounded" />
                    <input type="number" name="price" value={form.price} onChange={handleChange} className="border p-2 rounded" />
                    <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 rounded" />
                    <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded">
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Autre">Autre</option>
                    </select>
                    <div>
                      <p className="text-sm text-gray-500">Image actuelle :</p>
                      <img src={pin.imageUrl} alt={pin.title} className="w-32 h-20 object-cover rounded mb-2" />
                      <input type="file" name="image" onChange={handleChange} className="border p-2 rounded" />
                    </div>
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
                    <p className="font-semibold text-bleu">{pin.price} €</p>
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

     {/* Pagination */}
<div className="flex gap-2 mt-4 items-center">
  <button
    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
    disabled={currentPage === 1}
    className="px-3 py-1 border rounded"
  >
    Précédent
  </button>

  <span className="px-3 py-1">
    {currentPage} / {totalPages}
  </span>

  <input
    type="number"
    min={1}
    max={totalPages}
    value={pageInput}
    onChange={(e) => setPageInput(e.target.value)}
    className="border rounded px-2 py-1 w-16"
  />

  <button
    onClick={() => {
      const page = Number(pageInput);
      if (pageInput >= 1 && page <= totalPages) setCurrentPage(page);
    }}
    className="px-3 py-1 border rounded"
    disabled={
      pageInput === "" ||
      Number(pageInput) === currentPage ||
      Number(pageInput) < 1 ||
      Number(pageInput) > totalPages
    }
  >
    Valider
  </button>

  <button
    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
    disabled={currentPage === totalPages}
    className="px-3 py-1 border rounded"
  >
    Suivant
  </button>
</div>
    </div>
  );
};
export default Pins;
