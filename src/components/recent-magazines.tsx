import { MagazineCard } from "./magazine-card";
import { Section } from "./ui/section";

const recentMagazines = [
    {
        title: "Forbes Afrique",
        date: "Nov 2025",
        price: "3000 FCFA",
        category: "Business",
        coverImage: "/placeholder.jpg",
    },
    {
        title: "Amina",
        date: "Nov 2025",
        price: "2000 FCFA",
        category: "Mode",
        coverImage: "/placeholder.jpg",
    },
    {
        title: "So Foot",
        date: "Nov 2025",
        price: "2500 FCFA",
        category: "Sport",
        coverImage: "/placeholder.jpg",
    },
    {
        title: "Science & Vie",
        date: "Nov 2025",
        price: "2800 FCFA",
        category: "Science",
        coverImage: "/placeholder.jpg",
    },
];

export function RecentMagazines() {
    return (
        <Section
            title="Magazines récemment sortis"
            description="Découvrez les magazines les plus récemment sortis."
            action={{ label: "Voir tout", href: "/magazines" }}
        >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-8">
                {recentMagazines.map((mag, i) => (
                    <MagazineCard key={i} {...mag} />
                ))}
            </div>
        </Section>
    );
}