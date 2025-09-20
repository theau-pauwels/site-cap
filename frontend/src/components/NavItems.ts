export type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
  verifierOnly?: boolean;
};

export const navItems: NavItem[] = [
    { label: "Se connecter", href: "/login" },
    { label: "S'inscrire", href: "/register" },
    { label: "Pins", href: "/pins" },
    { label : "Pins personnalisés", href: "/demande-pins"},
    { label : "Demande de Penne", href: "/DemandePenne"},
    { label : "Mon panier", href: "/cart"},
    { label : "Mes commandes", href: "/myorders"},
    { label : "Admin", href: "/admin", adminOnly: true},
    { label : "Site Fédé", href: "https://fede.fpms.ac.be" },
];
