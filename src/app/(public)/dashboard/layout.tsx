import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tableau de bord | kioskfy",
    description: "Gérez vos favoris, achats et paramètres sur kioskfy",
    robots: {
        index: false,
        follow: false,
    },
};

export { default } from "./DashboardLayoutClient";