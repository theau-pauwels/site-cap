import { useEffect } from "react";

export default function ActivationClient() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");

    if (token) {
      fetch(`/api/auth/activate/${token}`, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            alert("Compte activé ! Vous pouvez maintenant vous connecter.");
          } else {
            alert("Erreur : " + data.error);
          }
        })
        .catch(() => alert("Erreur serveur"));
    }
  }, []);

  return null;
}
