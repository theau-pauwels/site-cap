export type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
  verifierOnly?: boolean;
};

export const navItems: NavItem[] = [
    { label: "Se connecter", href: "/login" },
    { label: "S'inscrire", href: "/register" },
    { label: "Articles", href: "/pins" },
    { label : "Pins personnalisés", href: "/demande-pins"},
    { label : "Demande de Penne", href: "/DemandePenne"},
    { label : "Admin", href: "/admin", adminOnly: true},
    { label : "Site Fédé", href: "https://www.fede.fpms.ac.be/cercles&commissions/cap" },
];
