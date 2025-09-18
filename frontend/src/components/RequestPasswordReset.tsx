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
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h1>Réinitialiser votre mot de passe</h1>
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
          />
          <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
            {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
          </button>
        </form>
      )}
    </div>
  );
};

export default RequestPasswordReset;
