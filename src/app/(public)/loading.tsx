import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 animate-in fade-in duration-500">
            {/* Hero Section Skeleton */}
            <section className="relative overflow-hidden border-b border-border/40 py-8">
                <div className="container mx-auto px-4">
                    {/* Categories Skeleton */}
                    <div className="flex gap-3 overflow-hidden">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-10 w-24 rounded-full flex-shrink-0"
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Section Skeleton */}
            <section className="container mx-auto px-4 py-12">
                {/* Title Skeleton */}
                <div className="mb-8 space-y-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-1 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Skeleton className="h-4 w-72 ml-4" />
                </div>

                {/* Grid Skeleton with staggered animation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Loading indicator */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 border border-border shadow-lg backdrop-blur-sm">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                        Chargement
                    </span>
                    <span className="flex gap-0.5">
                        <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-primary" />
                    </span>
                </div>
            </div>
        </div>
    );
}
