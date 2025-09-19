// src/pages/RequestPasswordReset.tsx
import { useState } from "react";

const RequestPasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.");
      } else {
        setMessage(`Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
      <h1 className="text-2xl font-bold mb-4 text-bleu" >Réinitialiser votre mot de passe</h1>
      {message && <p>{message}</p>}
      {!message && (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" 
          className="rounded-lg border-2 border-bleu bg-bleu px-4 py-2 text-white transition duration-150 hover:bg-blue-50 hover:text-bleu" 
          disabled={loading} style={{ padding: "10px 20px" }}>
            {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
          </button>
        </form>
      )}
      </div>
    </div>
  );
};

export default RequestPasswordReset;
