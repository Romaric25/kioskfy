import { Footer } from '@/components/footer';
import { Header } from '@/components/menus/header';
import { Hero } from '@/components/hero';
import { Section } from '@/components/ui/section';
import { CountryCarousel } from '@/components/country-carousel';
import { FeaturedNewspapers } from '@/components/featured-newspapers';
import { RecentMagazines } from '@/components/recent-magazines';
import { CategoriesSection } from '@/components/categories-section';
import { AgenciesCarrousel } from '@/components/agencies-carrousel';

export default function RootPage() {
    return (
        <>
            <Header />
            <Hero />
         
            <CategoriesSection />
           
            <CountryCarousel />
            <FeaturedNewspapers />
            <RecentMagazines />
            <AgenciesCarrousel />
            <Footer />
        </>
    )
}
