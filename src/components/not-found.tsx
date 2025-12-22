import * as React from "react";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";


export interface NotFoundProps {
  title?: string;
  description?: string;
  homeHref?: string | null;
  supportHref?: string | null;
  className?: string;
}

/**
 * A premium, well-styled 404 / Not Found component.
 * Uses theme colors for consistent styling.
 */
export const NotFound = ({
  title = "Page introuvable",
  description = "La page que vous cherchez n'existe pas, a été déplacée ou est momentanément indisponible.",
  homeHref = "/",
  supportHref = null,
  className,
}: NotFoundProps) => {
  return (
    <section
      aria-label="404 - Page non trouvée"
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16",
        className
      )}
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Gradient orbs using primary color */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted/50 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        {/* 404 Badge */}
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border bg-card/60 px-4 py-2 shadow-lg backdrop-blur-xl">
          <span className="inline-flex h-7 items-center rounded-full bg-destructive px-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            404
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            Page non trouvée
          </span>
        </div>

        {/* Animated 404 Number */}
        <div className="relative mb-6">
          <span className="text-[120px] font-black leading-none tracking-tighter text-foreground/90 sm:text-[160px]">
            404
          </span>
          {/* Glow effect */}
          <div className="absolute inset-0 -z-10 bg-primary/20 blur-3xl" />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mb-10 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {homeHref && (
            <a
              href={homeHref}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "group px-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour à l'accueil
              </span>
            </a>
          )}
          {supportHref && (
            <a
              href={supportHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "px-8 transition-all duration-300 hover:scale-105"
              )}
            >
              Contacter le support
            </a>
          )}
        </div>

        {/* Decorative bottom element */}
        <div className="mt-16 flex items-center gap-2 text-sm text-muted-foreground/60">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
          <span>Erreur 404</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
        </div>
      </div>
    </section>
  );
}

export default NotFound;
