import React, { useEffect, useState } from "react";

type Pin = {
  id: number;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  stock: number;
  category: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;

const AdminPins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const pinsPerPage = 40;

  const fetchPins = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur lors du chargement des pins");
      const data = await res.json();
      setPins(data);

      const initialStocks: Record<number, string> = {};
      data.forEach((pin) => (initialStocks[pin.id] = String(pin.stock)));
      setStockInputs(initialStocks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  useEffect(() => {
    setPageInput(String(currentPage));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const sanitizeStock = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return fallback;
    return Math.floor(parsed);
  };

  const updateStock = async (pinId: number, newStock: number) => {
    try {
      const res = await fetch(`${API_URL}${pinId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour du stock");

      setPins((prev) =>
        prev.map((pin) =>
          pin.id === pinId ? { ...pin, stock: newStock } : pin
        )
      );
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour le stock");
    }
  };

  if (loading) return <p>Chargement...</p>;

  // --- Normalisation catégorie
  const normalizeCategory = (cat: string | null | undefined) => {
    if (!cat) return "Autre";
    const trimmed = cat.trim();
    if (trimmed === "") return "Autre";
    if (trimmed.toLowerCase() === "autre") return "Autre";
    return trimmed;
  };

  const sortCategories = (a: string, b: string) => {
    const AUTRE = "Autre";
    if (a === AUTRE && b !== AUTRE) return 1;
    if (b === AUTRE && a !== AUTRE) return -1;
    return a.localeCompare(b);
  };

  // --- Toutes les catégories uniques pour le select
  const allCategories = Array.from(new Set(pins.map((p) => normalizeCategory(p.category)))).sort(
    sortCategories
  );

  // --- Filtrage catégorie
  const categoryFiltered = categorySearch
    ? pins.filter((p) => normalizeCategory(p.category) === categorySearch)
    : pins;

  // --- Filtrage texte
  const textFiltered = search
    ? categoryFiltered.filter((p) =>
        (p.title + " " + p.description)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : categoryFiltered;

  // --- Ensuite tri sur textFiltered
  const sortedPins = [...textFiltered].sort((a, b) => {
    const catComparison = sortCategories(
      normalizeCategory(a.category),
      normalizeCategory(b.category)
    );
    if (catComparison !== 0) return catComparison;
    return a.title.localeCompare(b.title);
  });

  // --- Pagination
  const totalPages = Math.max(1, Math.ceil(sortedPins.length / pinsPerPage));
  const start = (currentPage - 1) * pinsPerPage;
  const end = start + pinsPerPage;
  const paginatedPins = sortedPins.slice(start, end);

  // --- Groupement par catégorie
  const groupedPins = paginatedPins.reduce((acc, pin) => {
    const cat = normalizeCategory(pin.category);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pin);
    return acc;
  }, {} as Record<string, Pin[]>);

  const sortedCategories = Object.keys(groupedPins).sort(sortCategories);
  const parsedPageInput = Number(pageInput);
  const isPageInputValid =
    pageInput !== "" &&
    Number.isFinite(parsedPageInput) &&
    parsedPageInput >= 1 &&
    parsedPageInput <= totalPages &&
    parsedPageInput !== currentPage;

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h1 className="text-3xl font-bold mb-4 text-bleu">Gestion des Stocks</h1>

      {/* Recherche texte */}
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

      {/* Filtre catégorie */}
      <select
        value={categorySearch}
        onChange={(e) => {
          setCategorySearch(e.target.value);
          setCurrentPage(1);
        }}
        className="border p-2 rounded w-full max-w-md mb-4"
      >
        <option value="">Toutes les catégories</option>
        {allCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Liste des pins */}
      <div className="w-full flex flex-col gap-8">
        {sortedCategories.map((cat) => (
          <div key={cat}>
            <h2 className="text-2xl text-bleu font-semibold mb-4">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {groupedPins[cat].map((pin) => (
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
                  <p className="font-semibold text-bleu">{pin.price} €</p>
                  <p className="font-semibold">Stock disponible : {pin.stock}</p>

                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-sm flex items-center gap-2">
                      Stock :
                      <input
                        type="number"
                        min={0}
                        value={stockInputs[pin.id] ?? ""}
                        onChange={(e) =>
                          setStockInputs((prev) => ({
                            ...prev,
                            [pin.id]: e.target.value,
                          }))
                        }
                        className="border rounded px-2 py-1 w-20"
                      />
                      <button
                        onClick={() =>
                          updateStock(
                            pin.id,
                            sanitizeStock(stockInputs[pin.id], pin.stock)
                          )
                        }
                        className="ml-2 bg-bleu text-white px-3 py-1 rounded font-semibold hover:bg-bleu/80 transition-colors"
                        disabled={
                          stockInputs[pin.id] === "" ||
                          sanitizeStock(stockInputs[pin.id], pin.stock) === pin.stock
                        }
                      >
                        Valider
                      </button>
                    </label>
                  </div>
                </div>
              ))}

              {/* Cases invisibles pour stabiliser la grille */}
              {Array.from({ length: pinsPerPage - paginatedPins.length }).map(
                (_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="invisible border rounded-lg p-4"
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap gap-2 mt-4 items-center justify-center">
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
            if (isPageInputValid) setCurrentPage(parsedPageInput);
          }}
          disabled={!isPageInputValid}
          className={`px-4 py-2 border rounded font-semibold transition-colors ${
            !isPageInputValid
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

export default AdminPins;
