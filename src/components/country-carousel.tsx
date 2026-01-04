"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useCountries } from "@/hooks/use-countries.hook";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MapPin } from "lucide-react";

export function CountryCarousel() {
  const { countries } = useCountries();

  // Plugin autoplay configuration
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <div className="w-full py-12 border-y bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-center tracking-tight">
            Disponible dans ces pays
          </h2>
          <p className="text-muted-foreground text-center text-sm max-w-lg">
            Explorez la presse locale et internationale de nos pays partenaires.
          </p>
        </div>

        <div className="relative px-4 group/carousel">
          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-6xl mx-auto"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {countries?.data?.map((country, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <Link
                    href={`/countries/${country.slug}`}
                    className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-border/50"
                  >

                    {/* Drapeau Circulaire avec effet de ring */}
                    <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden shadow-sm ring-2 ring-border group-hover:ring-primary group-hover:scale-110 transition-all duration-300">
                      <Image
                        src={country.flag}
                        alt={`Flag ${country.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 64px, 80px"
                      />
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/0 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>

                    {/* Nom du Pays */}
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm font-semibold text-center text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {country.name}
                      </span>
                    </div>

                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom Navigation buttons that appear on hover */}
            <div className="hidden md:block opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">

              <CarouselPrevious className="absolute -left-4 md:-left-12 h-10 w-10 border-none bg-background/80 hover:bg-background shadow-md backdrop-blur-sm" />
              <CarouselNext className="absolute -right-4 md:-right-12 h-10 w-10 border-none bg-background/80 hover:bg-background shadow-md backdrop-blur-sm" />
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
