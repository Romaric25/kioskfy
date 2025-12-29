"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    size = "md",
    text = "Chargement",
    className,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-16 w-16",
    };

    const dotSizes = {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
    };

    const innerDotSizes = {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4",
                fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
                className
            )}
        >
            {/* Animated Spinner */}
            <div className="relative">
                {/* Outer gradient ring */}
                <div
                    className={cn(
                        "animate-spin rounded-full border-4 border-muted border-t-primary",
                        sizeClasses[size]
                    )}
                />

                {/* Inner pulsing core */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className={cn(
                            "animate-pulse rounded-full bg-primary/80",
                            innerDotSizes[size]
                        )}
                    />
                </div>
            </div>

            {/* Loading text with bouncing dots */}
            {text && (
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-muted-foreground">
                        {text}
                    </span>
                    <span className="flex gap-0.5">
                        <span
                            className={cn(
                                "animate-bounce rounded-full bg-primary [animation-delay:-0.3s]",
                                dotSizes[size] === "h-4 w-4" ? "h-1.5 w-1.5" : "h-1 w-1"
                            )}
                        />
                        <span
                            className={cn(
                                "animate-bounce rounded-full bg-primary [animation-delay:-0.15s]",
                                dotSizes[size] === "h-4 w-4" ? "h-1.5 w-1.5" : "h-1 w-1"
                            )}
                        />
                        <span
                            className={cn(
                                "animate-bounce rounded-full bg-primary",
                                dotSizes[size] === "h-4 w-4" ? "h-1.5 w-1.5" : "h-1 w-1"
                            )}
                        />
                    </span>
                </div>
            )}
        </div>
    );
}

// Card skeleton for newspaper/magazine grids
export function CardSkeleton() {
    return (
        <div className="space-y-3 animate-in fade-in duration-300">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

// Grid of card skeletons
export function GridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

// Page loading with centered spinner
export function PageLoader({ text = "Chargement de la page" }: { text?: string }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}

// Inline loading for smaller sections
export function InlineLoader({ text = "Chargement" }: { text?: string }) {
    return (
        <div className="py-8 flex items-center justify-center">
            <LoadingSpinner size="sm" text={text} />
        </div>
    );
}
