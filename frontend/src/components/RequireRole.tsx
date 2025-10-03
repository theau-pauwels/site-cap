import { useEffect, useState } from "react";

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Liste des rôles autorisés
  redirectTo?: string; // URL de redirection si non autorisé
  loader?: React.ReactNode; // Affichage pendant vérification
}

export default function RequireRole({
  children,
  allowedRoles = ["admin"], // par défaut : seulement admin
  redirectTo = "/",
  loader = <div>Chargement...</div>,
}: RequireRoleProps) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("[RequireRole] Vérification d'authentification et du rôle...");

      try {
        const res = await fetch("/api/me", { credentials: "include" });
        console.log("[RequireRole] Response status:", res.status);

        if (!res.ok) {
          console.warn("[RequireRole] Utilisateur non connecté → redirection", redirectTo);
          window.location.href = redirectTo;
          return;
        }

        const data = await res.json();
        console.log("[RequireRole] Données reçues:", data);

        if (allowedRoles.includes(data.role)) {
          console.log("[RequireRole] Accès autorisé ✅");
          setAuthorized(true);
        } else {
          console.warn(
            `[RequireRole] Accès refusé ❌ (rôle: ${data.role}, attendu: ${allowedRoles})`
          );
          window.location.href = redirectTo;
        }
      } catch (err) {
        console.error("[RequireRole] Erreur fetch :", err);
        window.location.href = redirectTo;
      } finally {
        setChecking(false);
        console.log("[RequireRole] Vérification terminée");
      }
    };

    checkAuth();
  }, [allowedRoles, redirectTo]);

  if (checking) {
    return <>{loader}</>;
  }

  if (!authorized) {
    return null; // redirection déjà faite
  }

  return <>{children}</>;
}
