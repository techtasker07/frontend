'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { supabaseApi, MarketplaceListing } from '@/lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { Search, Filter, Heart, Eye, MapPin, Bed, Bath, Car, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';

export default function MarketplacePage() {
   const [searchTerm, setSearchTerm] = useState('');
   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
   const { isAuthenticated } = useAuth();

   // Use SWR for instant data fetching and caching
   const { data: listings = [], error, isLoading } = useSWR(
     'marketplace-listings',
     async () => {
       console.log('🔄 Marketplace: Starting to fetch listings...');
       const params = {
         limit: 100 // Fetch more since no server-side filtering
       };

       console.log('🚀 Marketplace: Calling getMarketplaceListings API with params:', params);
       const response = await supabaseApi.getMarketplaceListings(params);
       const firstListing = response.data?.[0];
       console.log('📊 Marketplace: API response:', {
         success: response.success,
         dataLength: response.data?.length || 0,
         error: response.error,
         sampleData: firstListing ? {
           id: firstListing.id,
           title: firstListing.title,
           price: firstListing.price,
           location: firstListing.location,
           hasImages: (firstListing.images?.length ?? 0) > 0,
           isActive: firstListing.is_active
         } : 'No data'
       });

       if (response.success) {
         console.log('✅ Marketplace: Setting listings data, count:', response.data.length);
         return response.data;
       } else {
         console.error('❌ Marketplace: Failed to fetch listings:', response.error);
         return [];
       }
     },
     {
       revalidateOnFocus: false,
       revalidateOnReconnect: true,
       dedupingInterval: 30000, // Cache for 30 seconds
       errorRetryCount: 3,
       errorRetryInterval: 1000,
     }
   );

   const filteredListings = listings.filter((listing) =>
     searchTerm === '' ||
     listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     listing.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     listing.price?.toString().includes(searchTerm)
   );


  const formatPrice = (price: number, currency: string = '₦', period?: string) => {
    const formatted = `${currency}${price.toLocaleString()}`;
    return period ? `${formatted}/${period}` : formatted;
  };

  const getImageUrl = (listing: MarketplaceListing) => {
    if (listing.images?.length && listing.images.length > 0) {
      const primaryImage = listing.images.find((img: any) => img.is_primary);
      return primaryImage?.image_url || listing.images[0]?.image_url;
    }
    return '/api/placeholder/400/300';
  };


  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with Background */}
      <div className="p-8 text-center space-y-4 text-black">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">Marketplace Property</h1>
            <p className="text-muted-foreground">
              Discover your perfect property from our curated selection of homes, apartments, and commercial spaces
            </p>
          </div>
          {isAuthenticated && (
            <Button asChild variant="secondary" size="lg" className="shrink-0">
              <Link href="/marketplace/create">
                <Plus className="mr-2 h-5 w-5" />
                Create Listing
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by location, property name, description, or price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                  <div className="h-6 bg-gray-300 rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium">No Properties Found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria to find more properties.
              </p>
            </div>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={getImageUrl(listing)}
                    alt={listing.title || 'Property'}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Property Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {listing.listing_type?.name || 'sale'}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-semibold line-clamp-1">
                    {listing.title}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{listing.location}</span>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {formatPrice(listing.price || 0, '₦')}
                  </div>
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/marketplace/${listing.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
