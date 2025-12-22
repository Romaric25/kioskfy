"use client";


import { usePublishedNewspapers } from "@/hooks/use-newspapers.hook";
import { NewspaperCard } from "./newspaper-card";
import { NewspaperCardSkeleton } from "./skeletons/newspaper-card-skeleton";
import { Section } from "./ui/section";


export function FeaturedNewspapers() {
  const { newspapers, newspapersLoading, newspapersError } = usePublishedNewspapers();
  const featuredNewspapers = newspapers?.data?.slice(0, 4) || [];

  return (
    <Section
      title="À la une aujourd'hui"
      description="Les journaux les plus lus ce matin en Afrique."
      action={{ label: "Voir tout", href: "/journaux" }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-8">
        {newspapersLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
