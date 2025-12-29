import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 animate-in fade-in duration-300">
            {/* Left side - Form Skeleton */}
            <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="mx-auto w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="space-y-2 text-center">
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-4 w-64 mx-auto" />
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-px flex-1" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-px flex-1" />
                    </div>

                    {/* Social buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 rounded-md" />
                        <Skeleton className="h-10 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Right side - Branding Skeleton */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />

                {/* Center content */}
                <div className="relative z-10 max-w-lg space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    </div>
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <Skeleton className="h-4 w-80 mx-auto" />
                    <Skeleton className="h-4 w-72 mx-auto" />
                </div>
            </div>
        </div>
    );
}
