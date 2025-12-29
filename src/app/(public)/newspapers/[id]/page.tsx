"use client";

import { SingleNewspaper } from "@/components/newspapers/single-newspaper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewspapersPage() {
    const router = useRouter();

    return (
        <>
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="container mx-auto px-4 py-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </div>
            </header>
            <SingleNewspaper />
        </>
    );
}