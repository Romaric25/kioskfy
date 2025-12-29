"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewspaperBackButton() {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 text-muted-foreground hover:text-foreground"
        >
            <ArrowLeft className="h-4 w-4" />
            Retour
        </Button>
    );
}
