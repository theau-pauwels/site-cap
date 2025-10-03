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

type CartItem = Pin & { quantity: number };

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE}/api/pins/`;

const MemberPins: React.FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [categorySearch, setCategorySearch] = useState("");
  const pinsPerPage = 40;

  const [search, setSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);


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
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        setIsAuthenticated(res.ok);
      } catch (err) {
        console.error("Impossible de déterminer l'authentification", err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    setPageInput(String(currentPage));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const addToCart = (pin: Pin, quantity?: number) => {
    const fallback = quantities[pin.id];
    const qty = quantity ?? (fallback !== undefined ? Number(fallback) : 1);
    const normalizedQty = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;
    const updatedCart = [...cart, { ...pin, quantity: normalizedQty }];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${pin.title} ajouté au panier x${normalizedQty} !`);
  };

  // Normalisation catégorie
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

  // Toutes les catégories uniques pour le select
  const allCategories = Array.from(new Set(pins.map((p) => normalizeCategory(p.category)))).sort(
    sortCategories
  );

  // --- Filtrage par catégorie
  const categoryFiltered = categorySearch
    ? pins.filter((p) => normalizeCategory(p.category) === categorySearch)
    : pins;

  // --- Filtrage par texte (titre ou description)
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
      <h1 className="text-3xl font-bold mb-4 text-bleu">Liste des articles</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1); // reset pagination quand on fait une recherche
        }}
        placeholder="Rechercher un article..."
        className="border p-2 rounded w-full max-w-md mb-4"
      />

      {/* Select catégorie */}
      <select
        value={categorySearch}
        onChange={(e) => {
          setCategorySearch(e.target.value);
          setCurrentPage(1); // reset page à 1 quand on filtre
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
                <div key={pin.id} className="border rounded-lg shadow bg-white p-4 flex flex-col gap-3">
                  <img src={pin.imageUrl} alt={pin.title} className="rounded-lg w-full h-48 object-cover" />
                  <h3 className="text-lg font-bold">{pin.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {pin.description.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                  <p className="font-semibold text-bleu text-lg">{pin.price} €</p>

                  <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                    <p className="font-semibold">Stock disponible : {pin.stock}</p>
                    {isAuthenticated ? (
                      <>
                        <label className="text-sm font-medium" htmlFor={`qty-${pin.id}`}>
                          Quantité
                        </label>
                        <input
                          id={`qty-${pin.id}`}
                          type="number"
                          min={1}
                          value={quantities[pin.id] ?? ""}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [pin.id]: e.target.value,
                            }))
                          }
                          className="border p-2 rounded w-full"
                          placeholder="0"
                        />
                        <button
                          onClick={() => {
                            const qty = Number(quantities[pin.id]);
                            if (qty >= 1) addToCart(pin, qty);
                          }}
                          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 w-full font-semibold"
                          disabled={
                            quantities[pin.id] === "" ||
                            Number(quantities[pin.id]) < 1
                          }
                        >
                          Ajouter au panier
                        </button>
                      </>
                    ) : isAuthenticated === false ? (
                      <p className="text-sm text-gray-500 italic">
                        Connecte-toi pour ajouter cet article au panier.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Vérification en cours…</p>
                    )}
                  </div>
                </div>
              ))}
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

export default MemberPins;
