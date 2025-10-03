import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
};

type FormState = {
  title: string;
  price: string;
  description: string;
  category: string;
  stock: string;
  image: File | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;
const AUTRE = "Autre";
const initialFormState: FormState = {
  title: "",
  price: "",
  description: "",
  category: AUTRE,
  stock: "",
  image: null,
};

const Pins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [pinCategories, setPinCategories] = useState<string[]>([]);
  const [remoteCategories, setRemoteCategories] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({ ...initialFormState });

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [categorySearch, setCategorySearch] = useState("");
  const pinsPerPage = 40;

  /** Normalisation catégorie */
  const normalizeCategory = (cat: string | null | undefined) => {
    if (!cat) return AUTRE;
    const trimmed = cat.trim();
    if (trimmed === "") return AUTRE;
    if (trimmed.toLowerCase() === AUTRE.toLowerCase()) return AUTRE;
    return trimmed;
  };

  const sortCategories = (list: string[]) => {
    const withoutAutre = list.filter((cat) => cat !== AUTRE).sort((a, b) => a.localeCompare(b));
    return withoutAutre.concat(AUTRE);
  };

  /** Charger les pins et catégories */
  const fetchPins = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des pins");
      const data = await res.json();
      setPins(data);

      const uniqueCategories = Array.from(
        new Set(data.map((p: Pin) => normalizeCategory(p.category)))
      );
      setPinCategories(uniqueCategories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableCategories = async () => {
    try {
      const base = API_BASE.replace(/\/$/, "");
      const categoriesUrl = base ? `${base}/api/categories/` : "/api/categories/";
      const res = await fetch(categoriesUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRemoteCategories(data.map((cat) => normalizeCategory(cat)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPins();
    fetchAvailableCategories();
  }, []);

  useEffect(() => {
    const merged = new Set<string>();
    pinCategories.forEach((cat) => merged.add(normalizeCategory(cat)));
    remoteCategories.forEach((cat) => merged.add(normalizeCategory(cat)));
    const combined = merged.size === 0 ? [AUTRE] : sortCategories(Array.from(merged));
    setCategories(combined);
  }, [pinCategories, remoteCategories]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  /** --- Filtres et tri --- */
  const categoryFiltered = categorySearch
    ? pins.filter((p) => normalizeCategory(p.category) === categorySearch)
    : pins;

  const textFiltered = search
    ? categoryFiltered.filter((p) =>
        (p.title + " " + p.description).toLowerCase().includes(search.toLowerCase())
      )
    : categoryFiltered;

  const sortedPins = [...textFiltered].sort((a, b) => {
    const catA = normalizeCategory(a.category);
    const catB = normalizeCategory(b.category);
    if (catA !== catB) return catA.localeCompare(catB);
    return a.title.localeCompare(b.title);
  });

  // --- Pagination ---
  const totalPages = Math.ceil(sortedPins.length / pinsPerPage);
  const start = (currentPage - 1) * pinsPerPage;
  const end = start + pinsPerPage;
  const paginatedPins = sortedPins.slice(start, end);

  // --- Groupement par catégorie ---
  const groupedPins = paginatedPins.reduce((acc, pin) => {
    const cat = normalizeCategory(pin.category);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pin);
    return acc;
  }, {} as Record<string, Pin[]>);

  const sortedCategories = Object.keys(groupedPins).sort((a, b) =>
    a === AUTRE ? 1 : b === AUTRE ? -1 : a.localeCompare(b)
  );

  /** --- Handlers CRUD --- */
  const startEdit = (pin: Pin) => {
    setEditingId(pin.id);
    setForm({
      title: pin.title,
      price: pin.price,
      description: pin.description,
      category: normalizeCategory(pin.category),
      stock: String(pin.stock ?? 0),
      image: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...initialFormState });
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
      const stockValue = Number(form.stock);
      const sanitizedStock = Number.isFinite(stockValue) && stockValue >= 0 ? Math.floor(stockValue) : 0;
      formData.append("title", form.title);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("category", form.category || AUTRE);
      formData.append("stock", sanitizedStock.toString());
      if (form.image) formData.append("image", form.image);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      setForm({ ...initialFormState });
      fetchPins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleSubmit = async (pinId: number) => {
    try {
      const formData = new FormData();
      const stockValue = Number(form.stock);
      const sanitizedStock = Number.isFinite(stockValue) && stockValue >= 0 ? Math.floor(stockValue) : 0;
      formData.append("title", form.title);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("category", form.category || AUTRE);
      formData.append("stock", sanitizedStock.toString());
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
    <div className="flex flex-col items-center gap-8 p-6">

      {/* Ajout d’un pin */}
      <div className="border rounded-lg shadow bg-white p-4 mb-8 w-full">
        <h2 className="text-xl font-bold text-bleu mb-2">Ajouter un nouvel article</h2>
        <input type="text" name="title" placeholder="Titre" value={form.title} onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <input type="number" name="price" placeholder="Prix" value={form.price} onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <input type="number" name="stock" placeholder="Stock initial" min={0} value={form.stock} onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded mb-2 w-full">
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input type="file" name="image" onChange={handleChange} className="border p-2 rounded mb-2 w-full" />
        <button onClick={handleAddPin} className="bg-bleu text-white p-2 rounded w-full">Ajouter</button>
      </div>

      {/* Recherche */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        placeholder="Rechercher un article..."
        className="border p-2 rounded w-full max-w-md mb-4"
      />

      {/* Filtre par catégorie */}
      <select
        value={categorySearch}
        onChange={(e) => {
          setCategorySearch(e.target.value);
          setCurrentPage(1);
        }}
        className="border p-2 rounded w-full max-w-md mb-4"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Liste des pins groupés */}
      <div className="w-full flex flex-col gap-8">
      {sortedCategories.map((cat) => (
        <div key={cat}>
          <h2 className="text-2xl font-bold text-bleu mb-4">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {groupedPins[cat].map((pin) => (
              <div key={pin.id} className="border rounded-lg shadow bg-white p-4 flex flex-col gap-2">
                <img src={pin.imageUrl} alt={pin.title} className="rounded-lg w-full h-48 object-cover" />
                {editingId === pin.id ? (
                  <>
                    <input type="text" name="title" value={form.title} onChange={handleChange} className="border p-2 rounded" />
                    <input type="number" name="price" value={form.price} onChange={handleChange} className="border p-2 rounded" />
                    <input type="number" name="stock" min={0} value={form.stock} onChange={handleChange} className="border p-2 rounded" />
                    <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 rounded" />
                    <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded">
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
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
                    <p className="font-semibold">Stock disponible : {pin.stock}</p>
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
</div>
      {/* Pagination */}
<div className="flex gap-2 mt-4 items-center justify-center">
  <button
    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
    disabled={currentPage === 1}
    className={`px-4 py-2 border rounded font-semibold transition-colors ${
      currentPage === 1
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-bleu text-white hover:bg-bleu/80"
    }`}
  >
    Précédent
  </button>

  <span className="px-4 py-2 border rounded bg-gray-100 text-gray-700">
    {currentPage} / {totalPages}
  </span>

  <input
    type="number"
    min={1}
    max={totalPages}
    value={pageInput}
    onChange={(e) => setPageInput(e.target.value)}
    className="border rounded px-3 py-2 w-20 text-center"
  />

  <button
    onClick={() => {
      const page = Number(pageInput);
      if (pageInput >= 1 && page <= totalPages) setCurrentPage(page);
    }}
    className={`px-4 py-2 border rounded font-semibold transition-colors ${
      pageInput === "" ||
      Number(pageInput) === currentPage ||
      Number(pageInput) < 1 ||
      Number(pageInput) > totalPages
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-bleu text-white hover:bg-bleu/80"
    }`}
  >
    Valider
  </button>

  <button
    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
    disabled={currentPage === totalPages}
    className={`px-4 py-2 border rounded font-semibold transition-colors ${
      currentPage === totalPages
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-bleu text-white hover:bg-bleu/80"
    }`}
  >
    Suivant
  </button>
</div>
    </div>
  );
};

export default Pins;
