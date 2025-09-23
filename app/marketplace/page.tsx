'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { supabaseApi, MarketplaceListing, Category, PropertyType, ListingType } from '@/lib/supabase-api';
import { Search, Filter, Heart, Eye, MapPin, Bed, Bath, Car, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [selectedListingType, setSelectedListingType] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('');
  const [selectedBathrooms, setSelectedBathrooms] = useState<string>('');
  const [showFeatured, setShowFeatured] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedPropertyType, selectedListingType, selectedBedrooms, selectedBathrooms, showFeatured]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, propertyTypesRes, listingTypesRes] = await Promise.all([
        supabaseApi.getCategories(),
        supabaseApi.getPropertyTypes(),
        supabaseApi.getListingTypes()
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (propertyTypesRes.success) setPropertyTypes(propertyTypesRes.data);
      if (listingTypesRes.success) setListingTypes(listingTypesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory || undefined,
        property_type: selectedPropertyType || undefined,
        listing_type: selectedListingType || undefined,
        min_price: priceRange[0],
        max_price: priceRange[1],
        location: searchTerm || undefined,
        bedrooms: selectedBedrooms ? parseInt(selectedBedrooms) : undefined,
        bathrooms: selectedBathrooms ? parseInt(selectedBathrooms) : undefined,
        is_featured: showFeatured ? true : undefined,
        limit: 50
      };

      const response = await supabaseApi.getMarketplaceListings(params);
      if (response.success) {
        setListings(response.data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPropertyType('');
    setSelectedListingType('');
    setPriceRange([0, 10000000]);
    setSelectedBedrooms('');
    setSelectedBathrooms('');
    setShowFeatured(false);
    setSearchTerm('');
  };

  const formatPrice = (price: number, currency: string = '₦', period?: string) => {
    const formatted = `${currency}${price.toLocaleString()}`;
    return period ? `${formatted}/${period}` : formatted;
  };

  const getImageUrl = (listing: MarketplaceListing) => {
    if (listing.property?.property_images?.length > 0) {
      const primaryImage = listing.property.property_images.find(img => img.is_primary);
      return primaryImage?.image_url || listing.property.property_images[0]?.image_url;
    }
    return listing.property?.image_url || '/api/placeholder/400/300';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Property Marketplace</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover your perfect property from our curated selection of homes, apartments, and commercial spaces
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by location, property name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={selectedListingType} onValueChange={setSelectedListingType}>
              <SelectTrigger>
                <SelectValue placeholder="Listing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {listingTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Price Range</label>
              <span className="text-sm text-gray-500">
                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </span>
            </div>
            <Slider
              min={0}
              max={50000000}
              step={100000}
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              className="w-full"
            />
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              variant={showFeatured ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFeatured(!showFeatured)}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Featured Only
            </Button>
            
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>

            <div className="ml-auto flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">
            {listings.length} Properties Found
          </h2>
        </div>

        {loading ? (
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
        ) : listings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium">No Properties Found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or filters to find more properties.
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {listings.map((listing) => (
              <Card key={listing.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={getImageUrl(listing)}
                      alt={listing.property?.title || 'Property'}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Property Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {listing.is_featured && (
                      <Badge className="bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {listing.listing_type?.name}
                    </Badge>
                  </div>

                  {/* Favorite Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-4 right-4 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {listing.property?.title}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.property?.location}</span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
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

                  {/* Area */}
                  {(listing.area_sqft || listing.area_sqm) && (
                    <div className="text-sm text-gray-600">
                      {listing.area_sqft && `${listing.area_sqft} sqft`}
                      {listing.area_sqft && listing.area_sqm && ' • '}
                      {listing.area_sqm && `${listing.area_sqm} sqm`}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between">
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
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>{listing.views_count || 0}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/marketplace/${listing.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
