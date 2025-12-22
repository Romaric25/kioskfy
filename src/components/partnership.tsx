"use client";

import {
  Newspaper,
  TrendingUp,
  Users,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  PieChart,
  Smartphone,
  BarChart,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

// Reusable components for the design
const SectionHeader = ({
  badge,
  title,
  description,
  centered = true,
}: {
  badge?: string;
  title: string;
  description?: string;
  centered?: boolean;
}) => (
  <div className={cn("space-y-4 mb-12", centered && "text-center")}>
    {badge && (
      <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 text-primary rounded-full mb-4">
        {badge}
      </Badge>
    )}
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
      {title}
    </h2>
    {description && (
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>
    )}
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: any;
  title: string;
  description: string;
  className?: string;
}) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 hover:bg-card hover:shadow-lg transition-all duration-300",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative z-10">
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

const StatCard = ({ value, label, suffix = "+" }: { value: string; label: string; suffix?: string }) => (
  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
      {value}{suffix}
    </div>
    <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export function Partnership() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section with modern gradient mesh simulation */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-[100%] blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-[100%] blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Devenez Partenaire Premium
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
              Propulsez votre média <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-primary">
                vers le futur numérique
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Kioskfy est la plateforme de référence pour la distribution digitale de la presse africaine. Touchez des millions de lecteurs instantanément.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/organization/subscription">
                <Button size="xl" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/organization/subscription">
                <Button size="xl" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50">
                  Découvrir les avantages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="250" label="Journaux & Magazines" />
            <StatCard value="54" label="Pays Couverts" />
            <StatCard value="2M" label="Lecteurs Actifs" />
            <StatCard value="180" label="Croissance Revenus" suffix="%" />
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Innovation"
            title="Pourquoi choisir Kioskfy ?"
            description="Une suite d'outils puissants conçus spécifiquement pour les éditeurs de presse modernes qui souhaitent maximiser leur impact."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Globe}
              title="Distribution Mondiale"
              description="Vos publications accessibles instantanément dans 54 pays africains et auprès de la diaspora mondiale."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Monétisation Optimisée"
              description="Diversifiez vos sources de revenus grâce à notre modèle de partage équitable et transparent."
            />
            <FeatureCard
              icon={Users}
              title="Audience Qualifiée"
              description="Accédez à une communauté de lecteurs engagés, professionnels et décideurs à travers le continent."
            />
            <FeatureCard
              icon={Shield}
              title="Protection du Contenu"
              description="Technologie DRM avancée pour sécuriser vos publications contre le piratage et la distribution illégale."
            />
            <FeatureCard
              icon={BarChart}
              title="Analytics Détaillés"
              description="Tableau de bord complet pour suivre vos ventes, votre audience et vos performances en temps réel."
            />
            <FeatureCard
              icon={Zap}
              title="Publication Instantanée"
              description="Vos journaux disponibles dès leur sortie des presses, sans délai de distribution physique."
            />
          </div>
        </div>
      </section>

      {/* How it works - Timeline */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Simplicité"
            title="Comment ça marche ?"
            description="Intégrer Kioskfy est simple et rapide. Commencez à distribuer votre presse en moins de 48 heures."
          />

          <div className="relative max-w-4xl mx-auto mt-16">
            {/* Connecting Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 transform md:-translate-x-1/2" />

            {/* Step 1 */}
            <div className="relative flex flex-col md:flex-row gap-4 md:gap-16 items-start md:items-center mb-16 group">
              {/* Mobile: Text is right of bubble (via padding left on container). Desktop: Text is left of bubble */}
              <div className="md:w-1/2 md:text-right pl-16 md:pl-0">
                <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">1. Inscription</h3>
                <p className="text-muted-foreground">Créez votre compte partenaire vérifié et configurez votre profil éditeur avec vos informations légales.</p>
              </div>

              {/* Bubble: Left on mobile, Center on desktop */}
              <div className="absolute left-0 top-0 md:relative md:top-auto md:left-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-background border-4 border-primary/10 flex items-center justify-center z-10 shadow-xl group-hover:border-primary transition-colors shrink-0">
                <span className="text-lg md:text-xl font-bold text-primary">1</span>
              </div>

              {/* Empty space for desktop balance */}
              <div className="hidden md:block md:w-1/2" />
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col md:flex-row gap-4 md:gap-16 items-start md:items-center mb-16 group">
              {/* Empty space for desktop balance */}
              <div className="hidden md:block md:w-1/2" />

              {/* Bubble: Left on mobile, Center on desktop */}
              <div className="absolute left-0 top-0 md:relative md:top-auto md:left-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-background border-4 border-primary/10 flex items-center justify-center z-10 shadow-xl group-hover:border-primary transition-colors shrink-0">
                <span className="text-lg md:text-xl font-bold text-primary">2</span>
              </div>

              {/* Text: Right of bubble on mobile (padding), Right of bubble on desktop */}
              <div className="md:w-1/2 text-left pl-16 md:pl-0">
                <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">2. Intégration</h3>
                <p className="text-muted-foreground">Téléversez vos archives et configurez vos flux de publication automatique via notre interface intuitive.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row gap-4 md:gap-16 items-start md:items-center group">
              {/* Mobile: Text right of bubble. Desktop: Text left of bubble */}
              <div className="md:w-1/2 md:text-right pl-16 md:pl-0">
                <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">3. Distribution</h3>
                <p className="text-muted-foreground">Vos titres sont immédiatement disponibles à l'achat et à la lecture pour des millions d'utilisateurs.</p>
              </div>

              {/* Bubble: Left on mobile, Center on desktop */}
              <div className="absolute left-0 top-0 md:relative md:top-auto md:left-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-background border-4 border-primary/10 flex items-center justify-center z-10 shadow-xl group-hover:border-primary transition-colors shrink-0">
                <span className="text-lg md:text-xl font-bold text-primary">3</span>
              </div>

              {/* Empty space for desktop balance */}
              <div className="hidden md:block md:w-1/2" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/90" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-background/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 text-center text-primary-foreground shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Prêt à transformer votre distribution ?</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Rejoignez les 250+ éditeurs qui font confiance à Kioskfy pour leur croissance numérique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/organization/subscription">
                <Button size="xl" variant="secondary" className="h-16 px-10 text-lg font-bold rounded-full shadow-xl hover:scale-105 transition-transform">
                  S'inscrire maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="xl" variant="outline" className="h-16 px-10 text-lg rounded-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                Contacter l'équipe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="p-3 bg-background rounded-xl border border-border shadow-sm">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Email</h4>
                <p className="text-muted-foreground">partners@kioskfy.com</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="p-3 bg-background rounded-xl border border-border shadow-sm">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Téléphone</h4>
                <p className="text-muted-foreground">+225 27 20 00 00 00</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="p-3 bg-background rounded-xl border border-border shadow-sm">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Siège</h4>
                <p className="text-muted-foreground">Abidjan, Côte d'Ivoire</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
