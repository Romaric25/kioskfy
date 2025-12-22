import { clsx, type ClassValue } from "clsx"
import { LucideIcon, Landmark, TrendingUp, Trophy, Palette, Laptop, Heart, Shirt, Plane, Folder } from "lucide-react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, LucideIcon> = {
    Actualité: Landmark,
    Politique: Landmark,
    Économie: TrendingUp,
    Sport: Trophy,
    Culture: Palette,
    Technologie: Laptop,
    Santé: Heart,
    Mode: Shirt,
    Voyage: Plane,
    Magazine: Palette,
    News: Landmark,
    Business: TrendingUp,
    Sports: Trophy,
    Arts: Palette,
    Tech: Laptop,
    Health: Heart,
    Fashion: Shirt,
    Travel: Plane,
  };

  return iconMap[categoryName] || Folder;
};

// Fonction pour calculer la force du mot de passe
export const calculatePasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  // Calculer le score
  Object.values(checks).forEach((check) => {
    if (check) score += 1;
  });

  // Bonus pour la longueur
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Déterminer le label et la couleur
  if (score <= 2) {
    return { score, label: "Très faible", color: "bg-red-500" };
  } else if (score <= 3) {
    return { score, label: "Faible", color: "bg-orange-500" };
  } else if (score <= 4) {
    return { score, label: "Moyen", color: "bg-yellow-500" };
  } else if (score <= 5) {
    return { score, label: "Fort", color: "bg-blue-500" };
  } else {
    return { score, label: "Très fort", color: "bg-green-500" };
  }
};

export const protocol =
  process.env.NODE_ENV === 'production' ? 'https' : 'http';
export const rootDomain =
  process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';