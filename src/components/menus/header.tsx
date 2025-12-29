"use client";

import { Activity, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Handshake,
  Trash2,
  Newspaper,
  BookOpen,
  LogOut,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { Logo } from "../ui/logo";
import { useCartStore } from "@/stores/cart.store";
import { useAuth } from "@/hooks/use-auth.hook";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import Image from "next/image";
import { ThemeToggle } from "../ui/theme-toggle";
import { priceFormatter } from "@/lib/price-formatter";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isAgency = user?.typeUser === "agency";
  const { items, removeItem, total } = useCartStore();
  const cartCount = items.length;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-primary bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4">

            {/* Logo area */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group relative z-10">
                <Logo />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 p-1 bg-muted/30 rounded-full border border-border/40 backdrop-blur-sm">
              <Button
                variant={pathname?.startsWith("/newspapers") ? "secondary" : "ghost"}
                className={`rounded-full gap-2 h-9 px-4 shadow-none transition-all ${pathname?.startsWith("/newspapers")
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                asChild
              >
                <Link href="/newspapers">
                  <Newspaper className="h-4 w-4" />
                  Journaux
                </Link>
              </Button>
              <Button
                variant={pathname?.startsWith("/magazines") ? "secondary" : "ghost"}
                className={`rounded-full gap-2 h-9 px-4 shadow-none transition-all ${pathname?.startsWith("/magazines")
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                asChild
              >
                <Link href="/magazines">
                  <BookOpen className="h-4 w-4" />
                  Magazines
                </Link>
              </Button>
            </nav>

            {/* Actions area */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Desktop */}
              <SearchBar
                className="hidden lg:block w-full max-w-xs"
                inputClassName="w-64 focus-visible:w-72"
              />

              {/* Partner Button - Premium Gold Style */}
              <Button
                variant="outline"
                size="sm"
                className="hidden xl:flex items-center gap-2 rounded-full border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent hover:from-amber-500/20 hover:to-amber-500/5 hover:border-amber-500/50 text-foreground transition-all duration-300 shadow-sm hover:shadow-amber-500/20 hover:scale-105 h-9"
                asChild
              >
                <Link href="/partnership">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors mr-1.5">
                    <Handshake className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">Devenir partenaire</span>
                </Link>
              </Button>

              <div className="flex items-center gap-1 border-l pl-2 ml-2 border-border/50">
                {/* Cart */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 hover:bg-muted/50">
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-[10px] border-2 border-background animate-in zoom-in">
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 shadow-xl border-border/60" align="end">
                    <div className="p-4 font-semibold border-b bg-muted/20 flex justify-between items-center">
                      <span>Panier</span>
                      <Badge variant="secondary" className="rounded-full">{cartCount} items</Badge>
                    </div>
                    <ScrollArea className="h-full max-h-[300px]">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                          <div className="bg-muted p-4 rounded-full">
                            <ShoppingCart className="h-8 w-8 opacity-40" />
                          </div>
                          <p className="text-sm">Votre panier est vide</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-4">
                          {items.map((item) => (
                            <div key={item.id} className="flex gap-4 group">
                              <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md border shadow-sm group-hover:scale-105 transition-transform">
                                <Image
                                  src={item.coverImage!}
                                  alt={item.issueNumber}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-1 flex-col justify-between py-0.5">
                                <div>
                                  <h3 className="line-clamp-1 text-sm font-semibold">{item.issueNumber}</h3>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {item.organization?.name}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-primary">
                                    {priceFormatter(item.price, item.country?.currency, "fr")}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    {items.length > 0 && (
                      <div className="p-4 border-t bg-muted/20 space-y-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-lg">
                            {priceFormatter(total(), items[0]?.country?.currency, "fr")}
                          </span>
                        </div>
                        <Button className="w-full rounded-full shadow-lg shadow-primary/20" asChild>
                          <Link href="/cart">
                            Procéder au paiement
                          </Link>
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                {/* Auth */}

                <Activity mode={isAuthenticated ? "visible" : "hidden"}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted/50">
                        <Avatar className="h-9 w-9 border border-border/50 rounded-full">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold flex items-center justify-center w-full h-full rounded-full text-xs">
                            {((user?.lastName?.charAt(0) ?? "") + (user?.name?.charAt(0) ?? "")).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name} {user?.lastName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Activity mode={isAgency ? "visible" : "hidden"}>
                        <DropdownMenuItem asChild>
                          <Link href="/organization/dashboard" className="cursor-pointer font-medium">
                            <User className="mr-2 h-4 w-4" />
                            <span>Mon agence</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </Activity>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer font-medium">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer font-medium hover:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Se déconnecter</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Activity>

                <Activity mode={isAuthenticated ? "hidden" : "visible"}>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted/50" asChild>
                    <Link href="/login">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                </Activity>


                <div className="mx-1">
                  <ThemeToggle />
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full ml-auto"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar - Visible only on mobile below the main header row */}
          <div className="md:hidden pb-3 animate-in fade-in slide-in-from-top-2">
            <SearchBar
              inputClassName="w-full"
              placeholder="Rechercher..."
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="p-0 border-l border-border/40 bg-background/95 backdrop-blur-xl w-[320px] sm:w-[380px]">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <div className="flex flex-col h-full">
            {/* Header with User Info or Logo */}
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Logo />
                </Link>
                {/* Close button is automatically added by SheetContent usually, but we can leave space or add custom if needed. 
                    Radix Sheet adds a close button accessible via screen readers and UI. */}
              </div>

              {isAuthenticated && user && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm rounded-full ">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold flex items-center justify-center w-full h-full rounded-full">
                      {((user?.lastName?.charAt(0) ?? "") + (user?.name?.charAt(0) ?? "")).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 py-2">
                {/* Main Navigation */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 px-2 uppercase tracking-wider">Explorer</h4>

                  <Link
                    href="/newspapers"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Newspaper className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Journaux</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </Link>

                  <Link
                    href="/magazines"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Magazines</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </Link>
                </div>

                {/* Account Routes */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 px-2 uppercase tracking-wider">Mon Compte</h4>

                  <Activity mode={isAuthenticated ? "visible" : "hidden"}>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Mon Profil</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                    </Link>
                  </Activity>

                  <Activity mode={isAuthenticated ? "hidden" : "visible"}>
                    <div className="px-2">
                      <Button className="w-full rounded-full shadow-md" onClick={() => setIsMobileMenuOpen(false)} asChild>
                        <Link href="/login">Se connecter</Link>
                      </Button>
                    </div>
                  </Activity>

                </div>

                {/* Partnership */}
                <div className="pt-2">
                  <Link
                    href="/partnership"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block group"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10 p-4 transition-all hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Handshake className="h-4 w-4" />
                        </div>
                        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                      </div>
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Devenir partenaire</h4>
                      <p className="text-xs text-amber-700/80 dark:text-amber-300/80">Rejoignez notre réseau de distribution et développez votre audience.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 border-t border-border/40 bg-muted/20 mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Thème</span>
                <ThemeToggle />
              </div>

              <Activity mode={isAuthenticated ? "visible" : "hidden"}>
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 justify-start"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </Activity>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
