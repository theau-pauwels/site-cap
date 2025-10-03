import { useState, useEffect } from "react";
import { navItems as originalNavItems, type NavItem } from "./NavItems";

type Me = {
  email?: string;
  role?: string;
  member_id?: string;
  identifiant?: string; 
};


export default function Nav() {
  const [role, setRole] = useState<string>("guest");
  const [me, setMe] = useState<Me | null>(null);
  const [showMenu, setShowMenu] = useState(false);

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

  const userMenuLinks = [
    { label: "Mon compte", href: "/account" },
    { label: "Mes commandes", href: "/myorders" },
    { label: "Panier", href: "/cart" },
  ];

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
                className="relative px-1 py-1 after:absolute after:bottom-0 after:left-0 after:z-50 after:h-[3px] after:w-0 after:rounded-full after:bg-bleu after:duration-500 hover:after:w-full"
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
<div
  className="relative inline-block"
  onMouseEnter={() => setShowMenu(true)}
  onMouseLeave={() => setShowMenu(false)}
>
  <span className="cursor-pointer flex items-center gap-1">
    Connecté : <strong>{me.identifiant}</strong> ({me.role})
    <svg width="16" height="16" fill="currentColor" className="ml-1 text-bleu" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.063a.75.75 0 111.08 1.04l-4.25 4.667a.75.75 0 01-1.08 0l-4.25-4.667a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  </span>
  {showMenu && (
    <div className="absolute right-0 mt-0 w-64 bg-white border rounded shadow-lg z-10 text-base">
      <ul>
        {userMenuLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="block px-4 py-2 hover:bg-blue-50 text-bleu"
            >
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-50"
          >
            Se déconnecter
          </button>
        </li>
      </ul>
    </div>
  )}
</div>
        ) : (
          <span className="text-gray-500">Non connecté</span>
        )}
      </div>
    </nav>
  );
}