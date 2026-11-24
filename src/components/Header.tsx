"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Menu,
  Heart,
  Instagram,
  Sparkles,
  User,
  PackageSearch,
  X,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { products } from "@/data/products";
import { SITE_CONFIG, formatBRL, getPixPrice } from "@/lib/constants";
import { trackInstagramClick, trackSearch } from "@/lib/analytics";
import { EASE_ARTISAN } from "@/components/motion/MotionPrimitives";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Toda a Coleção", href: "/colecao" },
  { label: "Sala", href: "/colecao?ambiente=Sala" },
  { label: "Quarto", href: "/colecao?ambiente=Quarto" },
  { label: "Capas & Cozinha", href: "/colecao?ambiente=Cozinha" },
  { label: "Jogos de Banheiro", href: "/colecao?ambiente=Banheiro" },
  { label: "Mesa Posta", href: "/colecao?ambiente=Mesa+Posta" },
  { label: "Sob Medida", href: "/sob-medida", highlight: true },
  { label: "Sobre a Sueli", href: "/sobre" },
];

export function Header() {
  const router = useRouter();
  const { getTotalItems, setIsCartOpen } = useCart();
  const { items: wishlistItems, setIsWishlistOpen } = useWishlist();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerFirstName, setCustomerFirstName] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const totalItems = getTotalItems();

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const rawName =
            (user.user_metadata?.full_name as string) ||
            user.email?.split("@")[0] ||
            "Minha Conta";
          setCustomerFirstName(rawName.split(" ")[0]);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user;
        if (u) {
          const rawName =
            (u.user_metadata?.full_name as string) ||
            u.email?.split("@")[0] ||
            "Minha Conta";
          setCustomerFirstName(rawName.split(" ")[0]);
        } else {
          setCustomerFirstName(null);
        }
      });

      return () => subscription.unsubscribe();
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.room.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    trackSearch(trimmed, searchResults.length);
    setSearchFocused(false);
    router.push(`/colecao?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="bg-card/95 backdrop-blur border-b border-border sticky top-0 z-40 shadow-soft">
      <div className="container mx-auto py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Ateliê Sueli Crochê */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0 group"
          >
            <motion.div
              whileHover={{ rotate: -6, scale: 1.06 }}
              transition={{ duration: 0.25, ease: EASE_ARTISAN }}
              className="w-10 h-10 bg-gradient-warm rounded-full flex items-center justify-center shadow-warm"
            >
              <span className="text-primary-foreground font-serif font-bold text-base tracking-tight">
                SC
              </span>
            </motion.div>
            <div className="leading-tight">
              <span className="block text-lg sm:text-xl font-serif font-bold text-foreground">
                Ateliê Sueli Crochê
              </span>
              <span className="block text-[11px] text-primary font-medium">
                Feito à mão com amor • {SITE_CONFIG.instagramHandle}
              </span>
            </div>
          </Link>

          {/* Barra de Busca Instantânea (Desktop) */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Buscar tapete redondo, passadeira, jogo de banheiro..."
                aria-label="Buscar produtos no Ateliê Sueli Crochê"
                className="pl-10 pr-8 bg-background rounded-full border-border focus-visible:ring-primary transition-shadow"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            <AnimatePresence>
              {searchFocused && query.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE_ARTISAN }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-warm overflow-hidden z-50"
                >
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-border">
                      {searchResults.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/produto/${item.slug}`}
                          onClick={() => {
                            trackSearch(query.trim(), searchResults.length);
                            setSearchFocused(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.category} • {item.room}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-pix">
                              {formatBRL(getPixPrice(item.price))}
                            </p>
                            <p className="text-[10px] text-muted-foreground">no PIX</p>
                          </div>
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full py-2.5 text-xs font-semibold text-primary hover:bg-secondary/50 text-center"
                      >
                        Ver todos os resultados para &ldquo;{query}&rdquo;
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma peça encontrada para &ldquo;{query}&rdquo;.{" "}
                      <Link
                        href="/sob-medida"
                        onClick={() => setSearchFocused(false)}
                        className="text-primary font-medium underline"
                      >
                        Encomende sob medida!
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              <Link
                href={customerFirstName ? "/conta" : "/conta/entrar"}
                aria-label="Minha Conta e Rastreamento de Entrega"
              >
                <User className="h-4 w-4 sm:mr-1.5 text-primary" />
                <span className="hidden xl:inline">
                  {customerFirstName ? `Olá, ${customerFirstName}` : "Entrar / Pedidos"}
                </span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsWishlistOpen(true)}
              className="relative rounded-full"
              aria-label="Abrir lista de favoritos"
            >
              <Heart className="h-4 w-4 sm:mr-1.5 text-primary" />
              <span className="hidden lg:inline">Favoritos</span>
              {wishlistItems.length > 0 && (
                <motion.span
                  key={wishlistItems.length}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="ml-1 bg-secondary text-foreground rounded-full text-xs font-semibold px-1.5 py-0.5"
                >
                  {wishlistItems.length}
                </motion.span>
              )}
            </Button>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="rounded-full bg-gradient-warm text-primary-foreground shadow-soft hover:shadow-warm transition-all"
                aria-label="Abrir sacola de compras"
              >
                <ShoppingBag className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Sacola</span>
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.65 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 16 }}
                  className="ml-1.5 bg-white/20 text-primary-foreground rounded-full text-xs font-bold px-2 py-0.5"
                >
                  {totalItems}
                </motion.span>
              </Button>
            </motion.div>

            {/* Menu Mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden rounded-full h-9 w-9"
                  aria-label="Abrir menu de categorias"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] flex flex-col">
                <SheetHeader className="text-left border-b border-border pb-4">
                  <SheetTitle className="font-serif text-xl">
                    Ateliê Sueli Crochê
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    Peças artesanais feitas ponto a ponto pela Sueli
                  </p>
                </SheetHeader>

                <form
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setMobileMenuOpen(false);
                  }}
                  className="mt-4"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="O que você procura?"
                      className="pl-9"
                    />
                  </div>
                </form>

                <nav className="flex flex-col gap-1 mt-4 flex-1 overflow-y-auto">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                        link.highlight
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.highlight && <Sparkles className="h-3.5 w-3.5" />}
                    </Link>
                  ))}
                </nav>

                <div className="border-t border-border pt-4 space-y-2">
                  <Link
                    href={customerFirstName ? "/conta" : "/conta/entrar"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
                  >
                    <PackageSearch className="h-4 w-4" />
                    {customerFirstName
                      ? `Meus Pedidos (${customerFirstName})`
                      : "Entrar / Acompanhar Entrega"}
                  </Link>
                  <a
                    href={SITE_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackInstagramClick("mobile_menu")}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-secondary text-sm font-semibold text-foreground hover:bg-accent transition-colors"
                  >
                    <Instagram className="h-4 w-4 text-primary" />
                    {SITE_CONFIG.instagramHandle}
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Menu de Categorias Desktop */}
        <nav
          aria-label="Categorias da loja"
          className="hidden md:flex items-center justify-center gap-1 lg:gap-2 pt-3 mt-3 border-t border-border/60 flex-wrap"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all ${
                link.highlight
                  ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold inline-flex items-center gap-1"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              {link.highlight && <Sparkles className="h-3.5 w-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
