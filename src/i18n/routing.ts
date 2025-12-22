import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
    // Seul le français est supporté
    locales: ["fr"],

    // Locale par défaut
    defaultLocale: "fr",
});

// Lightweight wrappers around Next.js' navigation APIs
// that will correctly handle the locale prefix
export const { redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
