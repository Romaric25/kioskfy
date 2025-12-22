import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./ui/logo";
import { Input } from "./ui/input";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-muted/30 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand & Social */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              La première plateforme de distribution de presse numérique en Afrique. Accédez à vos journaux et magazines préférés partout, tout le temps.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="h-10 w-10 rounded-full border border-border/50 bg-background flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-300">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-border/50 bg-background flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-300">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-border/50 bg-background flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-300">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-border/50 bg-background flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-300">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-tight uppercase text-foreground/80">
              Navigation
            </h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/journaux" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">Journaux</Link>
              <Link href="/magazines" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">Magazines</Link>
              <Link href="/abonnements" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">Abonnements</Link>
              <Link href="/kiosque" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">Mon Kiosque</Link>
            </nav>
          </div>

          {/* Links Column 2 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-tight uppercase text-foreground/80">
              Aide & Support
            </h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/faq" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">FAQ</Link>
              <Link href="/contact" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">Nous contacter</Link>
              <Link href="/cgv" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">CGV</Link>
              <Link href="/confidentialite" className="hover:text-primary transition-colors hover:translate-x-1 duration-200">Politique de confidentialité</Link>
            </nav>
          </div>

          {/* Newsletter / Apps */}
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-tight uppercase text-foreground/80">
                Newsletter
              </h3>
              <p className="text-sm text-muted-foreground text-pretty max-w-xs">
                Inscrivez-vous pour recevoir les dernières actualités et offres exclusives.
              </p>
              <form className="flex gap-2 max-w-sm">
                <Input
                  type="email"
                  placeholder="Votre email"
                  className="h-10 bg-background border-border/60 focus-visible:ring-primary/20"
                />
                <Button type="submit" size="sm" className="h-10 px-4 bg-foreground text-background hover:bg-foreground/90">OK</Button>
              </form>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/40">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Télécharger l'application</h4>
              <div className="flex flex-wrap gap-2">
                {/* App Store Button - SVG Simplified */}
                <Link href="#" className="flex items-center gap-2 px-3 py-1.5 bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg transition-colors border border-transparent shadow-sm">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.71 19.5c-.31.96-1.04 2.23-2.23 2.23-1.03 0-1.28-.62-2.39-.62-1.12 0-1.42.62-2.39.62-1.15 0-1.92-1.25-2.28-2.25-1.55-4.2 1.39-6.27 1.39-9.52 0-2.82-1.67-4.22-3.15-4.22-1.09 0-2.31.62-2.95.62-.68 0-1.78-.65-3.03-.65-2.36 0-4.63 1.89-4.63 5.4 0 3.73 1.86 6.7 4.54 6.7 1.13 0 2.29-.86 3.66-.86 1.33 0 2.26.86 3.42.86 1.42 0 2.5-1.25 3.56-2.25 1.1-1.67 1.55-3.3 1.58-3.41-.03-.04-3.01-1.15-3.01-4.7 0-2.88 2.39-5.18 5.18-5.18.23 0 .47.02.69.04.09 1.4-1.27 3.59-3.26 3.59-.97 0-2.25-.66-2.25-2.38 0-1.89 1.94-3.69 4.14-3.69.31 0 .63.03.94.07.16 2.05 1.83 2.97 2.06 3.08-2.38 2.82-2.18 6.54.49 8.23z" /></svg>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-medium opacity-80">Télécharger sur</span>
                    <span className="text-xs font-bold font-sans">App Store</span>
                  </div>
                </Link>
                {/* Google Play Button - SVG Simplified */}
                <Link href="#" className="flex items-center gap-2 px-3 py-1.5 bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg transition-colors border border-transparent shadow-sm">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm11.487 11.48l6.844 6.845-3.097 1.772c-.78.446-1.74.32-2.39-.33l-1.357-1.357 11.487-11.487zm1.29-1.29l-4.507-4.507L21.936 2.14c.65-.65 1.61-.776 2.39-.33l3.097 1.77-6.844 6.845zm-9.98 9.98L16.6 11.796 5.113.309 6.406 21.985z" /></svg>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-medium opacity-80">DISPONIBLE SUR</span>
                    <span className="text-xs font-bold font-sans">Google Play</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {currentYear} Kioskfy Inc. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
            <Link href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</Link>
            <Link href="#" className="hover:text-primary transition-colors">Plan du site</Link>
          </div>
          <p className="flex items-center gap-1">
            Fait avec ❤️ en Afrique <Heart className="h-3 w-3 text-red-500 fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
}
