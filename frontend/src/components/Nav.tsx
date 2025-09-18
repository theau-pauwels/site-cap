import { useState, useEffect } from "react";
import { navItems as originalNavItems, type NavItem } from "./NavItems";

type Me = {
  email?: string;
  role?: string;
  member_id?: string;
  identifiant?: string;  // 🔹 ajouté
};


export default function Nav() {
  const [role, setRole] = useState<string>("guest");
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setRole("guest");
          setMe(null);
          return;
        }
        const data = await res.json();
        setRole(data.role || "guest");
        setMe(data);
      })
      .catch(() => {
        setRole("guest");
        setMe(null);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setRole("guest");
    setMe(null);
    // Optionnel : reload de la page pour forcer la redirection
    window.location.href = "/";
  };

  // Filtrer les items selon la connexion
  const navItems = originalNavItems.filter((item) => {
    if (item.adminOnly && role !== "admin") {
      if (!(item.verifierOnly && role === "verifier")) return false;
    }
    if (me && (item.label === "Se connecter" || item.label === "S'inscrire")) return false;
    return true;
  });

  return (
    <nav className="container mx-auto flex justify-between items-center gap-4 p-4">
      {/* Liens du menu */}
      <ul className="flex flex-wrap gap-4 text-sm lg:text-base">
        {navItems.map((item: NavItem) => (
          <li key={item.href} className="inline-flex">
            {item.label === "Site Fédé" ? (
              <a
                href={item.href}
                className="rounded-lg border-2 bleu bleu px-4 py-2 text-white transition duration-150 hover:bg-blue-50 hover:text-bleu"
              >
                {item.label}
              </a>
            ) : (
              <a
                href={item.href}
                className="relative px-1 py-1 
                  after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 after:rounded-full after:bg-bleu-barre after:duration-500 
                  hover:after:w-full"
                >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>


      {/* Partie droite (utilisateur connecté ou invité) */}
      <div className="text-sm text-gray-700 whitespace-nowrap">
        {me ? (
          <span>
            Connecté : <strong>{me.identifiant}</strong> ({me.role})
          </span>
        ) : (
          <span className="text-gray-500">Non connecté</span>
        )}

        <ul>
          {me && (
          <li className="flex flex-wrap gap-4 text-sm lg:text-base">
            <button
              onClick={handleLogout}
              className="relative text-red-700 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 after:rounded-full after:bg-red-700 after:duration-500 hover:after:w-full"
            >
              Se déconnecter
            </button>
          </li>
        )}
      </ul>
      </div>
    </nav>
  );
}