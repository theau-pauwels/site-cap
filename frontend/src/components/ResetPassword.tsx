// src/pages/ResetPassword.tsx
import React, { useState, useEffect } from "react";

const ResetPassword: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Récupère le token depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("Lien invalide.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://cap.fede.fpms.ac.be/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      if (data.ok) {
        setMessage("✅ Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.");
      } else {
        setMessage("❌ " + (data.error || "Erreur lors de la réinitialisation."));
      }
    } catch (err) {
      setMessage("❌ Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Réinitialisation du mot de passe</h1>
        {message && (
          <div className="mb-4 p-3 text-sm rounded bg-gray-200 text-gray-800">
            {message}
          </div>
        )}
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Confirmez le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "En cours..." : "Réinitialiser"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
