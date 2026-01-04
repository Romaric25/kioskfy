"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

interface SearchBarProps {
    className?: string;
    inputClassName?: string;
    placeholder?: string;
}

export function SearchBar({ className, inputClassName, placeholder = "Rechercher un journal..." }: SearchBarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const timeoutRef = useRef<NodeJS.Timeout>(null);
    const paths = ["/newspapers", "/magazines", "/categories", "/countries"];

    const shouldShow = paths.some((path) => pathname?.startsWith(path));

    const handleSearch = (term: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (term) {
                params.set("q", term);
            } else {
                params.delete("q");
            }
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }, 300);
    };

    if (!shouldShow) return null;

    return (
        <div className={cn("relative group mt-4", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <Input
                type="search"
                placeholder={placeholder}
                defaultValue={searchParams.get("q")?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                    "h-10 rounded-full border-muted-foreground/20 bg-muted/20 pl-10 text-sm shadow-none focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary transition-all duration-300",
                    inputClassName
                )}
            />
        </div>
    );
}
