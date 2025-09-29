"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "./PropertyCard";
import { SearchSection } from "./SearchSection";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { supabaseApi, Property } from "../lib/supabase-api";

export function PropertyListings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayLimit, setDisplayLimit] = useState(3);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    propertyType: '',
    priceRange: ''
  });

  const gridClass = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'grid grid-cols-1 gap-6';

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await supabaseApi.getProperties({ limit: 10 });
        if (response.success) {
          const sortedProperties = response.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setProperties(sortedProperties);
          setFilteredProperties(sortedProperties);
        } else {
          setError(response.error || 'Failed to load properties');
        }
      } catch (err) {
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const applyFilters = () => {
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

  if (loading) {
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
            {error}
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
          <TabsList className="flex flex-wrap w-full max-w-lg text-xs gap-2 bg-transparent">
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
              {filteredProperties.slice(0, displayLimit).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sale" className="mt-8">
            <div className={gridClass}>
              {filteredProperties.filter(p => p.type === "sale").slice(0, displayLimit).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rent" className="mt-8">
            <div className={gridClass}>
              {filteredProperties.filter(p => p.type === "rent").slice(0, displayLimit).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="book" className="mt-8">
            <div className={gridClass}>
              {filteredProperties.filter(p => p.type === "booking").slice(0, displayLimit).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="poll" className="mt-8">
            <div className={gridClass}>
              {filteredProperties
                .filter(p => p.pollPercentage && p.pollPercentage > 80)
                .slice(0, displayLimit)
                .map((property) => (
                  <PropertyCard key={property.id} property={property} />
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