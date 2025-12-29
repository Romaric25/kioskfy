export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
                {/* Animated Logo/Spinner */}
                <div className="relative">
                    {/* Outer ring with gradient */}
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />

                    {/* Inner pulsing dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-primary" />
                    </div>
                </div>

                {/* Loading text with fade animation */}
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-muted-foreground">
                        Chargement
                    </span>
                    <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                    </span>
                </div>
            </div>
        </div>
    );
}
