"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { api, Property } from "@/lib/api";
import { BudgetSearchModal } from "@/components/budget/budget-search-modal";
import { 
  Building2,
  Target,
  Users,
  LineChart,
  LogIn,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
} from "lucide-react";

/**
 * --------------------------------------------------------
 * Professional Home Page
 * - Clean, grid-first layout
 * - Consistent spacing & typographic scale
 * - Accessible controls & clearer empty/error states
 * - Uses shadcn/ui primitives + Tailwind + Framer Motion
 * --------------------------------------------------------
 */

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20">
            <Sparkles className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wider text-white">MIPRIPITY</p>
            <p className="text-[11px] text-white/70">Property Investment Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="secondary" size="sm" className="bg-white/10 text-white hover:bg-white/20">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">Create account</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                {user?.first_name} {user?.last_name}
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function useCurrencyInput(initial = "") {
  const [raw, setRaw] = useState(initial);

  const display = useMemo(() => {
    if (!raw) return "";
    const numeric = raw.replace(/[^\d]/g, "");
    if (!numeric) return "";
    return new Intl.NumberFormat("en-NG").format(Number(numeric));
  }, [raw]);

  const value = useMemo(() => {
    const numeric = raw.replace(/[^\d]/g, "");
    return numeric ? Number(numeric) : 0;
  }, [raw]);

  return { display, setRaw, value } as const;
}

function ProtectedNavButton({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <Button
      variant="outline"
      className="border-white/20 bg-white/10 text-white hover:bg-white/20"
      onClick={() => {
        if (!isAuthenticated) {
          router.push("/login");
        } else {
          router.push(href);
        }
      }}
    >
      {children}
    </Button>
  );
}

function Hero({ onOpenModal }: { onOpenModal: (list: Property[], budget: number) => void }) {
  const { isAuthenticated } = useAuth();
  const { display, setRaw, value } = useCurrencyInput("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) return;
    if (!value || value <= 0) return;

    setLoading(true);
    try {
      const response = await api.getPropertiesByBudget(value);
      if (response?.success) {
        onOpenModal(response.data, value);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative grid min-h-[70vh] place-items-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(5,9,20,0.55), rgba(5,9,20,0.65)), url(https://sdmntprwestus.oaiusercontent.com/files/00000000-0f74-6230-bc3f-0d776a252103/raw?se=2025-09-12T12%3A18%3A27Z&sp=r&sv=2024-08-04&sr=b&scid=6dc12359-3fcd-50b6-b0f5-715af6fa4da6&skoid=b64a43d9-3512-45c2-98b4-dea55d094240&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-11T22%3A01%3A06Z&ske=2025-09-12T22%3A01%3A06Z&sks=b&skv=2024-08-04&sig=3L0VVupWksnPx4A8NU95TrXvS8bNdqRV/ZgRYxMEg80%3D)",
      }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center text-white"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" /> Trusted by smart investors
          </div>
          <h1 className="text-balance text-3xl font-extrabold leading-tight sm:text-5xl">
            Properties. Prospects. <span className="text-blue-300">Polls. Profits.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/85 sm:mt-4 sm:text-lg">
            Discover investment opportunities with community insight and real-time market signals.
          </p>

          {/* Budget search */}
          <div className="mx-auto mt-6 max-w-xl">
            <label htmlFor="budget" className="sr-only">Enter your budget</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/70">₦</div>
              <Input
                id="budget"
                inputMode="numeric"
                value={display}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="Enter your budget"
                className="h-12 rounded-xl border-white/20 bg-white/10 pl-8 pr-28 text-white placeholder:text-white/50 focus:border-blue-300 focus:ring-blue-300"
                onKeyDown={async (e) => {
                  if (e.key === "Enter") await handleSubmit();
                }}
                disabled={loading || !isAuthenticated}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button disabled={!isAuthenticated || loading} onClick={handleSubmit} className="h-9 gap-2 rounded-lg px-3">
                          <Search className="h-4 w-4" />
                          <span className="hidden sm:inline">Find deals</span>
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Press Enter to search</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            {!isAuthenticated && (
              <p className="mt-2 text-sm text-white/80">
                Please <Link href="/login" className="underline underline-offset-4">log in</Link> to search by budget.
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <ProtectedNavButton href="/prospectProperties?category=Residential">Browse Residential</ProtectedNavButton>
            <ProtectedNavButton href="/prospectProperties?category=Land">Browse Land</ProtectedNavButton>
          </div>
        </motion.div>
      </div>

      {/* subtle bottom wave */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Property Listings",
      desc: "Comprehensive, high-signal listings with the details that matter.",
      accent: "bg-blue-50",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Smart Prospects",
      desc: "Algorithmic scoring and watchlists to surface opportunities.",
      accent: "bg-green-50",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Polls",
      desc: "Tap collective insight to validate investment theses.",
      accent: "bg-purple-50",
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Market Insights",
      desc: "Live trends and analytics to time your entry and exit.",
      accent: "bg-orange-50",
    },
  ];

  return (
    <section className="bg-white">
      <div className="container mx-auto grid gap-8 px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-bold sm:text-3xl">Why choose our platform?</h2>
          <p className="mt-2 text-muted-foreground">
            Get the insight you need to make confident property investment decisions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full rounded-xl border-muted bg-card/50">
                <CardContent className="p-5">
                  <div className={`mb-3 inline-flex rounded-lg p-2 ${it.accent}`}>{it.icon}</div>
                  <h3 className="text-base font-semibold">{it.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const go = (href: string) => {
    if (!isAuthenticated) router.push("/login");
    else router.push(href);
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-bold sm:text-3xl">Explore prospect categories</h2>
          <p className="mt-2 text-muted-foreground">
            Find the perfect opportunity across different property types.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Residential / Commercial */}
          <div className="group cursor-pointer" onClick={() => go("/prospectProperties?category=Residential")}>
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all group-hover:shadow-md">
              <div
                className="relative h-56 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=70)",
                }}
              >
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium">
                  <Image src="/residential.png" alt="Residential" width={18} height={18} />
                  Residential / Commercial
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Residential / Commercial Properties</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Houses, apartments, offices, and commercial buildings.
                </p>
              </div>
            </div>
          </div>

          {/* Land */}
          <div className="group cursor-pointer" onClick={() => go("/prospectProperties?category=Land")}>
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all group-hover:shadow-md">
              <div
                className="relative h-56 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70)",
                }}
              >
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium">
                  <Image src="/land.png" alt="Land" width={18} height={18} />
                  Land
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">Land Properties</h3>
                <p className="mt-1 text-sm text-muted-foreground">Undeveloped parcels, agricultural, and plots.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_100%,rgba(37,99,235,0.10),transparent_70%)]" />
      <div className="container relative mx-auto px-4 py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white/70 p-8 text-center shadow-sm backdrop-blur">
          <h3 className="text-2xl font-bold">Ready to get started?</h3>
          <p className="mt-2 text-muted-foreground">
            Join our community and start making informed property investment decisions today.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="rounded-xl">Get started today</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-xl">Join community polls</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetProperties, setBudgetProperties] = useState<Property[]>([]);
  const [budget, setBudget] = useState(0);
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-white text-foreground">
      <Navbar />

      <Hero
        onOpenModal={(list, amount) => {
          setBudgetProperties(list);
          setBudget(amount);
          setIsModalOpen(true);
        }}
      />

      <Features />

      {!isAuthenticated && (
        <>
          <Separator className="bg-gradient-to-r from-transparent via-muted to-transparent" />
          <CTA />
        </>
      )}

      <Categories />

      {/* Budget Search Modal */}
      <BudgetSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        properties={budgetProperties}
        budget={budget}
        loading={false}
      />

      <footer className="border-t bg-gray-50">
        <div className="container mx-auto grid gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-2 text-sm font-semibold tracking-wider">MIPRIPITY</div>
            <p className="text-sm text-muted-foreground">Property investment platform powered by community and data.</p>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Company</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Product</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link href="/prospectProperties?category=Residential">Residential</Link></li>
              <li><Link href="/prospectProperties?category=Land">Land</Link></li>
              <li><Link href="/polls">Polls</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Trust</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Verified listings</li>
              <li className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Secure by design</li>
            </ul>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} MIPRIPITY. All rights reserved.</div>
      </footer>
    </main>
  );
}
