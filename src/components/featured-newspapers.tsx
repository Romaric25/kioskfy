"use client";


import { usePublishedNewspapers } from "@/hooks/use-newspapers.hook";
import { NewspaperCard } from "./newspaper-card";
import { NewspaperCardSkeleton } from "./skeletons/newspaper-card-skeleton";
import { Section } from "./ui/section";


export function FeaturedNewspapers() {
  const { newspapers, newspapersLoading, newspapersError } = usePublishedNewspapers();
  const featuredNewspapers = newspapers?.data?.slice(0, 6) || [];

  return (
    <Section
      title="À la une aujourd'hui"
      description="Les derniers journaux sortis ce jour-ci."
      action={{ label: "Voir tout", href: "/newspapers" }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {newspapersLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <NewspaperCardSkeleton key={i} />
          ))
        ) : newspapersError ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Une erreur est survenue lors du chargement des journaux.
          </div>
        ) : featuredNewspapers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Aucun journal disponible pour le moment.
          </div>
        ) : (
          featuredNewspapers.map((newspaper) => (
            <NewspaperCard key={newspaper.id} newspaper={newspaper} />
          ))
        )}
      </div>
    </Section>
  );
}
