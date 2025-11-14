"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { PropertyCard } from "./PropertyCard";
import { SearchSection } from "./SearchSection";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Grid3X3, List, Search } from "lucide-react";
import { useHomeStore, type CombinedProperty } from "../lib/stores/home-store";

export function PropertyListings() {
  const {
    properties,
    filteredProperties,
    isLoading,
    error,
    viewMode,
    displayLimit,
    searchFilters,
    visibleCards,
    showSearchSection,
    activeTab,
    scrollPosition,
    lastViewedPropertyId,
    fetchProperties,
    setFilteredProperties,
    setViewMode,
    setDisplayLimit,
    setSearchFilters,
    applyFilters,
    setVisibleCards,
    setShowSearchSection,
    setActiveTab,
    setScrollPosition,
    setLastViewedPropertyId,
    saveStateToStorage,
    loadStateFromStorage
  } = useHomeStore();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const gridClass = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'grid grid-cols-1 gap-6';

  // Load state from storage and fetch properties on mount
  useEffect(() => {
    loadStateFromStorage();
    if (properties.length === 0 && !isLoading) {
      fetchProperties();
    }
  }, [loadStateFromStorage, properties.length, isLoading, fetchProperties]);

  // Save state to storage when it changes
  useEffect(() => {
    saveStateToStorage();
  }, [viewMode, displayLimit, searchFilters, showSearchSection, activeTab, scrollPosition, lastViewedPropertyId, saveStateToStorage]);

  // Restore scroll position or scroll to last viewed property when component mounts
  useEffect(() => {
    if (typeof window === 'undefined' || properties.length === 0) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (lastViewedPropertyId) {
        // Try to scroll to the last viewed property
        const element = document.getElementById(`property-${lastViewedPropertyId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (scrollPosition > 0) {
          // Fallback to saved scroll position
          window.scrollTo({ top: scrollPosition, behavior: 'instant' });
        }
      } else if (scrollPosition > 0) {
        window.scrollTo({ top: scrollPosition, behavior: 'instant' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [scrollPosition, lastViewedPropertyId, properties.length]);

  // Save scroll position on scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollPosition]);

  // Update filtered properties when properties data changes
  useEffect(() => {
    if (properties.length > 0) {
      console.log('📊 Setting filtered properties:', properties.length, 'items');
      setFilteredProperties(properties);
    }
  }, [properties, setFilteredProperties]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = parseInt(entry.target.getAttribute('data-index') || '0');
              setVisibleCards(new Set([...visibleCards, index]));
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
  }, [visibleCards, setVisibleCards]);

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

  // Log current state for debugging
  console.log('🎯 PropertyListings render state:', { 
    hasProperties: !!properties, 
    propertiesLength: properties?.length, 
    isLoading, 
    hasError: !!error,
    filteredLength: filteredProperties.length 
  });

  if (!properties || properties.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Properties Available</h2>
            <p className="text-gray-600">Check back soon for new listings!</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex justify-between items-center w-full md:w-auto md:block">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Properties</h2>
              <p className="text-gray-600">Discover your dream properties and</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setShowSearchSection(!showSearchSection)}
            >
              <Search className="h-5 w-5" />
            </Button>
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
        <div className={showSearchSection ? "block" : "hidden md:block"}>
          <SearchSection
            filters={searchFilters}
            onFiltersChange={(filters) => {
              setSearchFilters(filters);
              // Apply filters immediately when changed
              setTimeout(applyFilters, 0);
            }}
            onSearch={applyFilters}
          />
        </div>

        {/* Property Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="flex flex-wrap w-full text-xs gap-2 bg-transparent shadow-sm">
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
                  <Link
                    id={`property-${property.id}`}
                    href={property.source === 'marketplace' ? `/marketplace/${property.id}` : `/properties/${property.id}`}
                    onClick={() => setLastViewedPropertyId(property.id)}
                  >
                    <PropertyCard property={property} />
                  </Link>
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
                  <Link
                    id={`property-${property.id}`}
                    href={property.source === 'marketplace' ? `/marketplace/${property.id}` : `/properties/${property.id}`}
                    onClick={() => setLastViewedPropertyId(property.id)}
                  >
                    <PropertyCard property={property} />
                  </Link>
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
                  <Link
                    id={`property-${property.id}`}
                    href={property.source === 'marketplace' ? `/marketplace/${property.id}` : `/properties/${property.id}`}
                    onClick={() => setLastViewedPropertyId(property.id)}
                  >
                    <PropertyCard property={property} />
                  </Link>
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
                  <Link
                    href={property.source === 'marketplace' ? `/marketplace/${property.id}` : `/properties/${property.id}`}
                    onClick={() => setLastViewedPropertyId(property.id)}
                  >
                    <PropertyCard property={property} />
                  </Link>
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
                    <Link
                      href={property.source === 'marketplace' ? `/marketplace/${property.id}` : `/properties/${property.id}`}
                      onClick={() => setLastViewedPropertyId(property.id)}
                    >
                      <PropertyCard property={property} />
                    </Link>
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
            onClick={() => setDisplayLimit(displayLimit === 3 ? 12 : displayLimit + 12)}
          >
            Load More Properties
          </Button>
        </div>
      </div>
    </section>
  );
}