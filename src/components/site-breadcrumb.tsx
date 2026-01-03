"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";

interface BreadcrumbSegment {
    label: string;
    href?: string;
}

interface SiteBreadcrumbProps {
    items?: BreadcrumbSegment[];
}

import { ROUTE_LABELS } from "@/lib/route-labels";

export function SiteBreadcrumb({ items }: SiteBreadcrumbProps) {
    const pathname = usePathname();

    // Mode manuel: Si des items sont fournis, on les affiche
    if (items && items.length > 0) {
        return (
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                            <React.Fragment key={index}>
                                <BreadcrumbItem>
                                    {isLast || !item.href ? (
                                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator />}
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    // Mode automatique: On génère à partir de l'URL
    const paths = pathname?.split("/").filter(Boolean) || [];

    // Si pas de chemin (Accueil), on affiche rien ou juste Accueil? 
    // Généralement on n'affiche pas le fil d'Ariane sur la home.
    if (paths.length === 0) return null;

    return (
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {paths.map((path, index) => {
                    const isLast = index === paths.length - 1;
                    const href = `/${paths.slice(0, index + 1).join("/")}`;

                    // Logic pour label: Dictionnaire ou Capitalisation
                    let label = ROUTE_LABELS[path] || path.replace(/-/g, " ");

                    // Si c'est un ID (cuid/uuid > 20 chars), on met "Détails"
                    if (path.length > 20) {
                        label = "Détails";
                    }

                    return (
                        <React.Fragment key={index}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="capitalize">{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href} className="capitalize">{label}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
