"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from 'swr';
import { PropertyCard } from "./PropertyCard";
import { SearchSection } from "./SearchSection";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { supabaseApi, Property, MarketplaceListing } from "../lib/supabase-api";

// Combined property type for both poll and marketplace properties
type CombinedProperty = Property & {
  source?: 'poll' | 'marketplace';
  listing_type?: { name: string };
  property_type?: { name: string };
};

// Fetcher function for combined properties
const fetchProperties = async () => {
  // Fetch poll properties only
  const pollResponse = await supabaseApi.getProperties({ limit: 15, source: 'poll' });
  let marketplaceResponse;

  try {
    marketplaceResponse = await supabaseApi.getMarketplaceListings({ limit: 15 });
  } catch (error) {
    console.warn('Marketplace listings not available:', error);
    marketplaceResponse = { success: false, data: [], error: 'Marketplace not available' };
  }

  let allProperties: CombinedProperty[] = [];

  // Add poll properties
  if (pollResponse.success) {
    const pollProperties = pollResponse.data.map(prop => ({
      ...prop,
      source: 'poll' as const,
      current_worth: prop.current_worth || 0
    }));
    allProperties = [...allProperties, ...pollProperties];
  }

  // Add marketplace properties, converting to Property format (if available)
  if (marketplaceResponse.success && marketplaceResponse.data.length > 0) {
    const marketplaceProperties = marketplaceResponse.data.map((listing: MarketplaceListing): CombinedProperty => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      location: listing.location,
      user_id: listing.user_id,
      category_id: listing.category_id,
      current_worth: listing.price,
      year_of_construction: listing.year_of_construction,
      image_url: listing.images?.[0]?.image_url,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      category_name: listing.category?.name,
      images: listing.images?.map(img => ({
        id: img.id,
        property_id: listing.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
        created_at: listing.created_at
      })) || [],
      source: 'marketplace' as const,
      type: listing.listing_type?.name?.toLowerCase().replace('for ', '') || 'sale',
      listing_type: listing.listing_type,
      property_type: listing.property_type,
      vote_count: 0
    }));
    allProperties = [...allProperties, ...marketplaceProperties];
  }

  // Sort by creation date (most recent first)
  const sortedProperties = allProperties.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return sortedProperties;
};

export function PropertyListings() {
  const { data: properties, error, isLoading } = useSWR<CombinedProperty[]>('properties', fetchProperties, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000, // 5 minutes
  });

  const [filteredProperties, setFilteredProperties] = useState<CombinedProperty[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayLimit, setDisplayLimit] = useState(6);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    propertyType: '',
    priceRange: ''
  });
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const gridClass = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'grid grid-cols-1 gap-6';

  // Update filtered properties when properties data changes
  useEffect(() => {
    if (properties) {
      setFilteredProperties(properties);
    }
  }, [properties]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = parseInt(entry.target.getAttribute('data-index') || '0');
              setVisibleCards(prev => new Set([...prev, index]));
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, []);

  // Observe cards when they change
  useEffect(() => {
    cardRefs.current.forEach((ref, index) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        cardRefs.current.forEach(ref => {
          if (ref) observerRef.current!.unobserve(ref);
        });
      }
    };
  }, [filteredProperties, displayLimit]);

  const applyFilters = () => {
    if (!properties) return;

    let filtered = properties;

    if (searchFilters.location) {
      filtered = filtered.filter(p =>
        p.location?.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    if (searchFilters.propertyType) {
      // Match on title or description
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchFilters.propertyType.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchFilters.propertyType.toLowerCase())
      );
    }

    if (searchFilters.priceRange) {
      let min = 0, max = Infinity;
      switch (searchFilters.priceRange) {
        case '0-50m': max = 50000000; break;
        case '50m-100m': min = 50000000; max = 100000000; break;
        case '100m-200m': min = 100000000; max = 200000000; break;
        case '200m-500m': min = 200000000; max = 500000000; break;
        case '500m-1b': min = 500000000; max = 1000000000; break;
        case '1b+': min = 1000000000; break;
      }
      filtered = filtered.filter(p => {
        const price = p.current_worth || 0;
        return price >= min && price <= max;
      });
    }

    setFilteredProperties(filtered);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">
            Failed to load properties
          </div>
        </div>
      </section>
    );
  }

  if (!properties) {
    return null;
  }
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Properties</h2>
            <p className="text-gray-600">Discover your dream properties and</p>
          </div>
          
          <div className="hidden md:flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none border-l"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <SearchSection
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          onSearch={applyFilters}
        />

        {/* Property Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="flex flex-wrap w-full text-xs gap-2 bg-transparent">
            <TabsTrigger value="all" className="bg-blue-500 text-white rounded-lg border border-blue-600 data-[state=active]:bg-orange-500 data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="sale" className="bg-blue-500 text-white rounded-lg border border-blue-600 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <span className="hidden md:inline">For Sale</span>
              <span className="md:hidden">Sale</span>
            </TabsTrigger>
            <TabsTrigger value="rent" className="bg-blue-500 text-white rounded-lg border border-blue-600 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <span className="hidden md:inline">For Rent</span>
              <span className="md:hidden">Rent</span>
            </TabsTrigger>
            <TabsTrigger value="book" className="bg-blue-500 text-white rounded-lg border border-blue-600 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <span className="hidden md:inline">For Booking</span>
              <span className="md:hidden">Book</span>
            </TabsTrigger>
            <TabsTrigger value="poll" className="bg-blue-500 text-white rounded-lg border border-blue-600 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <span className="hidden md:inline">Top Polls</span>
              <span className="md:hidden">Polls</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <div className={gridClass}>
              {filteredProperties.slice(0, displayLimit).map((property, index) => (
                <div
                  key={property.id}
                  ref={(el) => {
                    if (el) cardRefs.current[index] = el;
                  }}
                  data-index={index}
                  className={`transition-all duration-700 ease-out ${
                    visibleCards.has(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sale" className="mt-8">
            <div className={gridClass}>
              {filteredProperties.filter(p => p.type === "sale").slice(0, displayLimit).map((property, index) => (
                <div
                  key={property.id}
                  ref={(el) => {
                    if (el) cardRefs.current[index] = el;
                  }}
                  data-index={index}
                  className={`transition-all duration-700 ease-out ${
                    visibleCards.has(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rent" className="mt-8">
            <div className={gridClass}>
              {filteredProperties.filter(p => p.type === "rent").slice(0, displayLimit).map((property, index) => (
                <div
                  key={property.id}
                  ref={(el) => {
                    if (el) cardRefs.current[index] = el;
                  }}
                  data-index={index}
                  className={`transition-all duration-700 ease-out ${
                    visibleCards.has(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="book" className="mt-8">
            <div className={gridClass}>
              {filteredProperties.filter(p => p.type === "booking").slice(0, displayLimit).map((property, index) => (
                <div
                  key={property.id}
                  ref={(el) => {
                    if (el) cardRefs.current[index] = el;
                  }}
                  data-index={index}
                  className={`transition-all duration-700 ease-out ${
                    visibleCards.has(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="poll" className="mt-8">
            <div className={gridClass}>
              {filteredProperties
                .filter(p => p.pollPercentage && p.pollPercentage > 80)
                .slice(0, displayLimit)
                .map((property, index) => (
                  <div
                    key={property.id}
                    ref={(el) => {
                      if (el) cardRefs.current[index] = el;
                    }}
                    data-index={index}
                    className={`transition-all duration-700 ease-out ${
                      visibleCards.has(index)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Load More */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setDisplayLimit(prev => prev === 3 ? 12 : prev + 12)}
          >
            Load More Properties
          </Button>
        </div>
      </div>
    </section>
  );
}