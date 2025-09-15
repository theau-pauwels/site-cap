export type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
  verifierOnly?: boolean;
};

export const navItems: NavItem[] = [
    { label: "Se connecter", href: "/login" },
    // { label: "S'inscrire", href: "/register" },
    { label: "Pins", href: "/pins" },
    { label: "Changer de mot de passe", href:"/app/password" },
    { label: "Liste d'utilisateurs", href:"/admin/users", adminOnly: true },
    { label: "Ajouter pins", href: "/adminpins", adminOnly: true },
    { label : "Commandes", href: "/admin/commandes", adminOnly: true},
    {label : "Mon panier", href: "/cart"},
    {label : "Mes commandes", href: "/myorders"},
    // { label : "Site Fédé", href: "https://fede.fpms.ac.be" },
];
