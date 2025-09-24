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
import { api, Property, PropertyImage } from "@/lib/api";
import { supabaseApi, MarketplaceListing } from "@/lib/supabase-api";
import { BudgetSearchModal } from "@/components/budget/budget-search-modal";
import { 
  Building2,
  Target,
  Users,
  LineChart,
  LogIn,
  LogOut,
  UserCircle,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  TrendingUp,
  Heart,
  Star,
  Zap,
  Crown,
  Compass,
  ShoppingBag,
  MapPin,
  Bed,
  Bath,
  Car,
  Eye,
  ArrowRight,
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
    <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="group inline-flex items-center gap-3">
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Sparkles className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">MIPRIPITY</h1>
              <p className="text-xs text-white">Community-Driven Property Intelligence</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="glow" size="sm">
                    <Star className="mr-2 h-4 w-4" /> Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.first_name} {user?.last_name}
                  </span>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <UserCircle className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 hover:text-red-600"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
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
  const router = useRouter();

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
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

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  const handleBrowseProspects = () => {
    if (isAuthenticated) {
      router.push('/prospectProperties');
    } else {
      router.push('/login');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/80 via-purple-80/900 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-200/90 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-200/90 to-transparent rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Community-Driven
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Property Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Make smarter property decisions with collective wisdom. Get real opinions from local communities,
            Controlled Market Place, and data-driven recommendations for your real estate investments.
          </motion.p>

          {/* Dynamic Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={handleGetStarted}
                  variant="gradient"
                  size="xl"
                  className="group"
                >
                  <Star className="mr-2 h-5 w-5 group-hover:animate-spin" />
                  Start Exploring Properties
                </Button>
                <Button
                  onClick={handleBrowseProspects}
                  variant="outline"
                  size="xl"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                >
                  <Compass className="mr-2 h-5 w-5" />
                  Browse Smart Prospects
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleGetStarted}
                  variant="glow"
                  size="xl"
                  className="group"
                >
                  <Crown className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Go to Dashboard
                </Button>
                <Button
                  onClick={handleBrowseProspects}
                  variant="shimmer"
                  size="xl"
                  className="group"
                >
                  <TrendingUp className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Explore Premium Prospects
                </Button>
              </>
            )}
          </motion.div>

          {/* Budget Search for Authenticated Users */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto max-w-xl"
            >
              <label htmlFor="budget" className="sr-only">Enter your budget</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">₦</div>
                <Input
                  id="budget"
                  inputMode="numeric"
                  value={display}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder="Enter your budget to find matching properties"
                  className="h-14 rounded-2xl border-gray-200 bg-white/80 pl-8 pr-32 text-lg backdrop-blur focus:border-indigo-300 focus:ring-indigo-300 shadow-lg"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") await handleSubmit();
                  }}
                  disabled={loading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button
                    disabled={loading}
                    onClick={handleSubmit}
                    variant="neon"
                    size="lg"
                    className="h-10"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Find Deals</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats for Non-Authenticated Users */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
            >
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">1,000+</div>
                <div className="text-sm text-gray-600 mt-1">Active Properties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5,000+</div>
                <div className="text-sm text-gray-600 mt-1">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">₦50B+</div>
                <div className="text-sm text-gray-600 mt-1">Properties Analyzed</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "Property Listings",
      desc: "Comprehensive, verified listings with detailed community insights and market analysis.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "bg-white", // Solid white background
      borderColor: "border-gray-200",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Smart Prospects",
      desc: "AI-powered algorithmic scoring and intelligent watchlists to surface the best opportunities.",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "bg-white", // Solid white background
      borderColor: "border-gray-200",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Polls",
      desc: "Real opinions from local communities and investors to validate your investment decisions.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "bg-white", // Solid white background
      borderColor: "border-gray-200",
    },
    {
      icon: <LineChart className="h-8 w-8" />,
      title: "Market Insights",
      desc: "Live market trends, analytics, and predictive insights to time your investments perfectly.",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "bg-white", // Solid white background
      borderColor: "border-gray-200",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mipripity?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the features that make property evaluation smarter, faster, and more reliable with community insights.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${item.bgGradient} border ${item.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 h-full overflow-hidden`}>
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
                
                {/* Icon container */}
                <div className="relative mb-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute -inset-2">
                    <div className={`w-1 h-1 bg-gradient-to-r ${item.gradient} rounded-full absolute top-0 right-0 opacity-60 group-hover:animate-ping`} />
                    <div className={`w-1 h-1 bg-gradient-to-r ${item.gradient} rounded-full absolute bottom-2 left-1 opacity-40 group-hover:animate-bounce`} style={{ animationDelay: '0.2s' }} />
                    <div className={`w-1 h-1 bg-gradient-to-r ${item.gradient} rounded-full absolute top-4 left-0 opacity-50 group-hover:animate-pulse`} style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {item.desc}
                </p>
                
                {/* Subtle glow effect on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedMarketplace() {
  const [featuredListings, setFeaturedListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const response = await supabaseApi.getMarketplaceListings({ 
          is_featured: true, 
          limit: 6 
        });
        if (response.success) {
          setFeaturedListings(response.data);
        }
      } catch (error) {
        console.error('Error fetching featured listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  const formatPrice = (price: number, currency: string = '₦', period?: string) => {
    const formatted = `${currency}${price.toLocaleString()}`;
    return period ? `${formatted}/${period}` : formatted;
  };

  const getImageUrl = (listing: MarketplaceListing) => {
    if (listing.property?.images?.length && listing.property.images.length > 0) {
      const primaryImage = listing.property.images.find((img: PropertyImage) => img.is_primary);
      return primaryImage?.image_url || listing.property.images[0]?.image_url;
    }
    return listing.property?.image_url || '/api/placeholder/400/300';
  };

  if (loading || featuredListings.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 px-4 py-2 text-sm backdrop-blur mb-4">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-gray-700">Featured Properties</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Marketplace Deals
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore our handpicked selection of premium properties available for sale, rent, lease, and booking.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
              onClick={() => router.push(`/marketplace/${listing.id}`)}
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-0 bg-white">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={getImageUrl(listing)}
                    alt={listing.property?.title || 'Property'}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Property Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90 text-gray-800 shadow-lg">
                      {listing.listing_type?.name}
                    </Badge>
                  </div>

                  {/* Property Stats */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-4 text-white text-sm">
                    {listing.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{listing.bedrooms}</span>
                      </div>
                    )}
                    {listing.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{listing.bathrooms}</span>
                      </div>
                    )}
                    {listing.parking_spaces > 0 && (
                      <div className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        <span>{listing.parking_spaces}</span>
                      </div>
                    )}
                  </div>

                  {/* Views count */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/30 text-white px-2 py-1 rounded-full text-xs backdrop-blur">
                    <Eye className="h-3 w-3" />
                    <span>{listing.views_count || 0}</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                      {listing.property?.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.property?.location}</span>
                    </div>

                    {/* Area */}
                    {(listing.area_sqft || listing.area_sqm) && (
                      <div className="text-sm text-gray-600">
                        {listing.area_sqft && `${listing.area_sqft} sqft`}
                        {listing.area_sqft && listing.area_sqm && ' • '}
                        {listing.area_sqm && `${listing.area_sqm} sqm`}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(listing.price, listing.currency, listing.price_period)}
                        </div>
                        {listing.property_type && (
                          <div className="text-sm text-gray-500">
                            {listing.property_type.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Button
            size="xl"
            variant="gradient"
            onClick={() => router.push('/marketplace')}
            className="group shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="mr-2 h-5 w-5 group-hover:animate-bounce" />
            Explore All Marketplace Properties
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
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
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  const handleSecondaryAction = () => {
    if (isAuthenticated) {
      router.push('/polls');
    } else {
      router.push('/login');
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isAuthenticated ? (
              <>
                Ready to Explore More{' '}
                <span className="bg-gradient-to-r from-cyan-200 to-pink-200 bg-clip-text text-transparent">
                  Premium Features?
                </span>
              </>
            ) : (
              <>
                Ready to Make Smarter{' '}
                <span className="bg-gradient-to-r from-cyan-200 to-pink-200 bg-clip-text text-transparent">
                  Property Decisions?
                </span>
              </>
            )}
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {isAuthenticated
              ? "Unlock advanced analytics, premium prospects, and exclusive community insights to maximize your investment returns."
              : "Join thousands of investors who trust Mipripity for community-driven property intelligence and data-driven insights."
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handlePrimaryAction}
                variant={isAuthenticated ? "shimmer" : "glow"}
                size="xl"
                className="group bg-white text-indigo-600 hover:bg-gray-50 hover:shadow-2xl hover:shadow-white/25"
              >
                {isAuthenticated ? (
                  <>
                    <Crown className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Access Dashboard
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-5 w-5 group-hover:animate-spin" />
                    Get Started Today
                  </>
                )}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSecondaryAction}
                variant="outline"
                size="xl"
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur"
              >
                {isAuthenticated ? (
                  <>
                    <Users className="mr-2 h-5 w-5" />
                    Join Community Polls
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-5 w-5" />
                    Explore Community
                  </>
                )}
              </Button>
            </motion.div>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm">Secure & Trusted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">Verified Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">5,000+ Members</span>
            </div>
          </div>
        </motion.div>
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

      <FeaturedMarketplace />

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
