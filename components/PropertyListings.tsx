"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "./PropertyCard";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { supabaseApi, MarketplaceListing } from "../lib/supabase-api";

export function PropertyListings() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = activeTab === "all" ? {} : { listing_type: activeTab };
        const response = await supabaseApi.getMarketplaceListings({ ...params, limit: 12 });
        if (response.success) {
          setListings(response.data);
        } else {
          setError(response.error || 'Failed to load listings');
        }
      } catch (err) {
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [activeTab]);

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
            <p className="text-gray-600">Discover your dream properties and more</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex border rounded-lg">
              <Button variant="ghost" size="sm" className="rounded-r-none">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-l-none border-l">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Listing Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="For Sale">For Sale</TabsTrigger>
            <TabsTrigger value="For Rent">For Rent</TabsTrigger>
            <TabsTrigger value="For Lease">For Lease</TabsTrigger>
            <TabsTrigger value="For Booking">For Booking</TabsTrigger>
            <TabsTrigger value="Poll">Poll</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Property Grid */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={listing.images?.[0]?.image_url || '/api/placeholder/400/300'}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {listing.listing_type?.name}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{listing.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="text-sm">{listing.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        ₦{listing.price.toLocaleString()}
                        {listing.price_period && <span className="text-sm font-normal">/{listing.price_period}</span>}
                      </div>
                      {listing.property_type && (
                        <div className="text-sm text-gray-500">{listing.property_type.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button className="flex-1 text-sm">View Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Properties
          </Button>
        </div>
      </div>
    </section>
  );
}