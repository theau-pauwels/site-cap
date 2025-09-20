import React, { useEffect, useState } from "react";

const AdminCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState("");

  const fetchCats = async () => {
    const res = await fetch("/api/categories/");
    setCategories(await res.json());
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const addCategory = async () => {
    if (!newCat.trim()) return;
    await fetch("/api/categories/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat }),
    });
    setNewCat("");
    fetchCats();
  };

  const deleteCategory = async (name: string) => {
    if (name === "Autre") return; // empêche de supprimer la catégorie par défaut
    await fetch(`/api/categories/${name}`, { method: "DELETE" });
    fetchCats();
  };

  return (
      <div className="p-4 border rounded shadow bg-white max-w-md mx-auto">
      <h2 className="text-xl font-bold text-bleu mb-2">Gérer les catégories</h2>

      {/* Ajouter une nouvelle catégorie */}
      <div className="flex gap-2 mb-4">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Nouvelle catégorie"
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={addCategory}
          className="bg-bleu text-white px-3 py-1 rounded"
        >
          Ajouter
        </button>
      </div>

      {/* Liste des catégories existantes */}
        <ul className="space-y-1">
        {categories.map((cat) => (
            <li key={cat} className="flex justify-between items-center">
            {cat}
            {cat !== "Autre" && (
                <button
                onClick={() => deleteCategory(cat)}
                className="bg-red-500 text-white px-2 py-1 rounded"
                >
                Supprimer
                </button>
            )}
            </li>
        ))}
        </ul>
    </div>
  );
};

export default AdminCategories;
