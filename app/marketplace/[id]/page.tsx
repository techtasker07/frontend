'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabaseApi, MarketplaceListing } from '@/lib/supabase-api';
import {
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Car,
  Star,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VirtualTourViewer, ImageTourViewer } from '@/components/virtual-tour/VirtualTourViewer';
import Map from '@/components/ui/map';

export default function MarketPropertyDetailsPage() {
  const params = useParams();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [relatedListings, setRelatedListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'location' | 'reviews'>('overview');
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showImageTour, setShowImageTour] = useState(false);
  const [virtualTourData, setVirtualTourData] = useState<any>(null);
  const [loadingVirtualTour, setLoadingVirtualTour] = useState(false);

  // Engagement form state
  const [engagementForm, setEngagementForm] = useState({
    name: '',
    email: '',
    phone: '',
    intention: '',
    meeting_type: 'call',
    scheduled_date: '',
    scheduled_time: ''
  });

  const [isEngagementOpen, setIsEngagementOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchListingDetails();
    }
  }, [params.id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await supabaseApi.getMarketplaceListing(params.id as string);

      if (response.success) {
        setListing(response.data);

        // Fetch related properties based on same category or location
        const relatedResponse = await supabaseApi.getMarketplaceListings({
          category: response.data.category?.name,
          limit: 4
        });

        if (relatedResponse.success) {
          // Filter out the current property from related listings
          const filtered = relatedResponse.data.filter(item => item.id !== response.data.id);
          setRelatedListings(filtered.slice(0, 3));
        }

        // Fetch virtual tour data
        await fetchVirtualTourData(response.data.id);
      }
    } catch (error) {
      console.error('Error fetching listing details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVirtualTourData = async (marketplaceListingId: string) => {
    try {
      setLoadingVirtualTour(true);
      const response = await fetch(`/api/virtual-tour?marketplaceListingId=${marketplaceListingId}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setVirtualTourData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching virtual tour data:', error);
    } finally {
      setLoadingVirtualTour(false);
    }
  };

  const getImages = () => {
    if (!listing) return [];

    const images = [];

    // Add property images
    if (listing.images && listing.images.length > 0) {
      images.push(...listing.images.map(img => img.image_url));
    }

    // Add placeholder if no images at all
    if (images.length === 0) {
      images.push('/api/placeholder/800/600');
    }

    return images;
  };

  const formatPrice = (price: number, currency: string = '₦', period?: string) => {
    const formatted = `${currency}${price.toLocaleString()}`;
    return period ? `${formatted}/${period}` : formatted;
  };

  const getPropertyPrice = (property: MarketplaceListing) => {
    if (property.price) {
      return formatPrice(property.price, property.currency, property.price_period);
    }
    return 'Price on request';
  };

  const handleEngagement = async () => {
    try {
      // Here you would send the engagement to your backend
      console.log('Engagement submitted:', engagementForm);
      // TODO: Implement API call to store in property_contact_requests table
      alert('Engagement request submitted successfully!');
      setIsEngagementOpen(false);
      setEngagementForm({ name: '', email: '', phone: '', intention: '', meeting_type: 'call', scheduled_date: '', scheduled_time: '' });
    } catch (error) {
      console.error('Error submitting engagement:', error);
      alert('Failed to submit engagement request');
    }
  };


  const toggleFavorite = async () => {
    if (!listing) return;
    
    try {
      if (isFavorite) {
        await supabaseApi.removeFromFavorites(listing.id);
      } else {
        await supabaseApi.addToFavorites(listing.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const nextImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-gray-300 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 bg-gray-300 rounded w-3/4" />
              <div className="h-20 bg-gray-300 rounded" />
              <div className="h-40 bg-gray-300 rounded" />
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-300 rounded" />
              <div className="h-20 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <Button asChild>
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const images = getImages();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/marketplace" className="hover:text-primary">Marketplace</Link>
        <span>/</span>
        <span>{listing.title}</span>
      </div>

      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/marketplace">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>
      </Button>

      {/* Image Gallery Grid */}
      <div className="grid grid-cols-4 gap-2 h-96">
        {/* Main Large Image */}
        <div className="col-span-3 relative overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={images[currentImageIndex] || '/api/placeholder/800/600'}
            alt={listing.title || 'Property'}
            fill
            className="object-cover"
          />
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/80 hover:bg-white"
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Property Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {listing.category?.name}
            </Badge>
            <Badge variant="outline" className="bg-white/90 text-gray-800 border-gray-300">
              {listing.listing_type?.name || 'For Sale'}
            </Badge>
          </div>
        </div>
        
        {/* Right Side Grid */}
        <div className="flex flex-col gap-2">
          {/* Virtual Tour Tile */}
          {virtualTourData && (
            <div
              className="relative h-[94px] bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setShowVirtualTour(true)}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Eye className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Virtual Tour</span>
                {loadingVirtualTour && (
                  <div className="mt-1">
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Additional Images */}
          {images.slice(1, virtualTourData ? 4 : 5).map((imageUrl, index) => (
            <div 
              key={index + 1}
              className="relative h-[94px] overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => setCurrentImageIndex(index + 1)}
            >
              <Image
                src={imageUrl}
                alt={`Property image ${index + 2}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {currentImageIndex === index + 1 && (
                <div className="absolute inset-0 ring-2 ring-blue-500 bg-blue-500/10" />
              )}
            </div>
          ))}
          
          {/* More Images Indicator */}
          {images.length > (virtualTourData ? 4 : 5) && (
            <div 
              className="relative h-[94px] bg-gray-900/80 rounded-lg overflow-hidden cursor-pointer group flex items-center justify-center"
              onClick={() => setShowImageTour(true)}
            >
              <div className="text-center text-white">
                <div className="text-lg font-bold">{images.length - (virtualTourData ? 4 : 5)}+</div>
                <div className="text-xs">More Photos</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{listing.location}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {getPropertyPrice(listing)}
                </div>
                <div className="text-sm text-gray-500">
                  {listing.category?.name}
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="flex items-center gap-6">
              {listing.year_of_construction && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>Built in {listing.year_of_construction}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'details', label: 'Details' },
                { id: 'location', label: 'Location' },
                { id: 'reviews', label: 'Reviews' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {listing.description || 'No description available.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Property Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {listing.year_of_construction && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Built in {listing.year_of_construction}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Category: {listing.category?.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* General Property Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Property Type:</span>
                        <span className="ml-2">{listing.property_type?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-2">{listing.category?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Listing Type:</span>
                        <span className="ml-2">{listing.listing_type?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">{listing.location}</span>
                      </div>
                      {listing.city && (
                        <div>
                          <span className="font-medium">City:</span>
                          <span className="ml-2">{listing.city}</span>
                        </div>
                      )}
                      {listing.state && (
                        <div>
                          <span className="font-medium">State:</span>
                          <span className="ml-2">{listing.state}</span>
                        </div>
                      )}
                      {listing.country && (
                        <div>
                          <span className="font-medium">Country:</span>
                          <span className="ml-2">{listing.country}</span>
                        </div>
                      )}
                      {listing.year_of_construction && (
                        <div>
                          <span className="font-medium">Year Built:</span>
                          <span className="ml-2">{listing.year_of_construction}</span>
                        </div>
                      )}
                      {listing.property_condition && (
                        <div>
                          <span className="font-medium">Condition:</span>
                          <span className="ml-2">{listing.property_condition}</span>
                        </div>
                      )}
                      {(listing.area_sqft || listing.area_sqm || listing.property_size) && (
                        <div>
                          <span className="font-medium">Property Size:</span>
                          <span className="ml-2">
                            {listing.property_size && listing.property_size}
                            {listing.area_sqft && ` ${listing.area_sqft} sqft`}
                            {listing.area_sqm && ` ${listing.area_sqm} sqm`}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Category-specific Details */}
                {listing.category?.name === 'Residential' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Residential Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listing.bedrooms && (
                          <div>
                            <span className="font-medium">Bedrooms:</span>
                            <span className="ml-2">{listing.bedrooms}</span>
                          </div>
                        )}
                        {listing.bathrooms && (
                          <div>
                            <span className="font-medium">Bathrooms:</span>
                            <span className="ml-2">{listing.bathrooms}</span>
                          </div>
                        )}
                        {listing.toilets && (
                          <div>
                            <span className="font-medium">Toilets:</span>
                            <span className="ml-2">{listing.toilets}</span>
                          </div>
                        )}
                        {listing.kitchen_size && (
                          <div>
                            <span className="font-medium">Kitchen Size:</span>
                            <span className="ml-2">{listing.kitchen_size}</span>
                          </div>
                        )}
                        {listing.dining_room && (
                          <div>
                            <span className="font-medium">Dining Room:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                        {listing.balcony_terrace && (
                          <div>
                            <span className="font-medium">Balcony/Terrace:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                        {listing.furnishing_status && (
                          <div>
                            <span className="font-medium">Furnishing Status:</span>
                            <span className="ml-2">{listing.furnishing_status}</span>
                          </div>
                        )}
                        {listing.parking_spaces > 0 && (
                          <div>
                            <span className="font-medium">Parking Spaces:</span>
                            <span className="ml-2">{listing.parking_spaces}</span>
                          </div>
                        )}
                        {listing.pet_friendly && (
                          <div>
                            <span className="font-medium">Pet Friendly:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                      </div>
                      {listing.appliances_included && listing.appliances_included.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">Appliances Included:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {listing.appliances_included.map((appliance, index) => (
                              <Badge key={index} variant="secondary">{appliance}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {listing.security_features && listing.security_features.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">Security Features:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {listing.security_features.map((feature, index) => (
                              <Badge key={index} variant="secondary">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {listing.neighbourhood_features && listing.neighbourhood_features.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">Neighbourhood Features:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {listing.neighbourhood_features.map((feature, index) => (
                              <Badge key={index} variant="secondary">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {listing.category?.name === 'Commercial' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Commercial Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listing.property_usage_type && (
                          <div>
                            <span className="font-medium">Property Usage Type:</span>
                            <span className="ml-2">{listing.property_usage_type}</span>
                          </div>
                        )}
                        {listing.total_floors && (
                          <div>
                            <span className="font-medium">Total Floors (Building):</span>
                            <span className="ml-2">{listing.total_floors}</span>
                          </div>
                        )}
                        {listing.floor_number && (
                          <div>
                            <span className="font-medium">Floor Number (Property Location):</span>
                            <span className="ml-2">{listing.floor_number}</span>
                          </div>
                        )}
                        {listing.office_rooms && (
                          <div>
                            <span className="font-medium">Office Rooms/Sections:</span>
                            <span className="ml-2">{listing.office_rooms}</span>
                          </div>
                        )}
                        {listing.conference_rooms && (
                          <div>
                            <span className="font-medium">Conference Rooms:</span>
                            <span className="ml-2">{listing.conference_rooms}</span>
                          </div>
                        )}
                        {listing.parking_spaces > 0 && (
                          <div>
                            <span className="font-medium">Parking Capacity:</span>
                            <span className="ml-2">{listing.parking_spaces}</span>
                          </div>
                        )}
                        {listing.internet_available && (
                          <div>
                            <span className="font-medium">Internet Available:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                        {listing.power_supply && (
                          <div>
                            <span className="font-medium">Power Supply:</span>
                            <span className="ml-2">{listing.power_supply}</span>
                          </div>
                        )}
                        {listing.loading_dock && (
                          <div>
                            <span className="font-medium">Loading Dock:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                        {listing.storage_space && (
                          <div>
                            <span className="font-medium">Storage Space:</span>
                            <span className="ml-2">{listing.storage_space}</span>
                          </div>
                        )}
                      </div>
                      {listing.accessibility_features && listing.accessibility_features.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">Accessibility Features:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {listing.accessibility_features.map((feature, index) => (
                              <Badge key={index} variant="secondary">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {listing.fire_safety_features && listing.fire_safety_features.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">Fire Safety & Compliance Features:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {listing.fire_safety_features.map((feature, index) => (
                              <Badge key={index} variant="secondary">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {listing.neighbourhood_features && listing.neighbourhood_features.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">Neighbourhood Features:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {listing.neighbourhood_features.map((feature, index) => (
                              <Badge key={index} variant="secondary">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {listing.category?.name === 'Land' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Land Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listing.land_type && (
                          <div>
                            <span className="font-medium">Land Type:</span>
                            <span className="ml-2">{listing.land_type}</span>
                          </div>
                        )}
                        {listing.title_document && (
                          <div>
                            <span className="font-medium">Title Document:</span>
                            <span className="ml-2">{listing.title_document}</span>
                          </div>
                        )}
                        {listing.topography && (
                          <div>
                            <span className="font-medium">Topography:</span>
                            <span className="ml-2">{listing.topography}</span>
                          </div>
                        )}
                        {listing.water_access && (
                          <div>
                            <span className="font-medium">Water Access:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                        {listing.electricity_access && (
                          <div>
                            <span className="font-medium">Electricity Access:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                        {listing.fence_boundary_status && (
                          <div>
                            <span className="font-medium">Fence/Boundary Status:</span>
                            <span className="ml-2">{listing.fence_boundary_status}</span>
                          </div>
                        )}
                        {listing.road_access && (
                          <div>
                            <span className="font-medium">Road Access:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                        {listing.soil_type && (
                          <div>
                            <span className="font-medium">Soil Type:</span>
                            <span className="ml-2">{listing.soil_type}</span>
                          </div>
                        )}
                      </div>
                      {listing.proximity_to_amenities && listing.proximity_to_amenities.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">Proximity to Amenities:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {listing.proximity_to_amenities.map((amenity, index) => (
                              <Badge key={index} variant="secondary">{amenity}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Rent-specific Details */}
                {listing.listing_type?.name === 'For Rent' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Rental Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listing.monthly_rent_amount && (
                          <div>
                            <span className="font-medium">Monthly Rent Amount:</span>
                            <span className="ml-2">{formatPrice(listing.monthly_rent_amount, listing.currency)}</span>
                          </div>
                        )}
                        {listing.security_deposit && (
                          <div>
                            <span className="font-medium">Security Deposit:</span>
                            <span className="ml-2">{formatPrice(listing.security_deposit, listing.currency)}</span>
                          </div>
                        )}
                        {listing.utilities_included && (
                          <div>
                            <span className="font-medium">Utilities Included:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                        {listing.payment_frequency && (
                          <div>
                            <span className="font-medium">Payment Frequency:</span>
                            <span className="ml-2">{listing.payment_frequency}</span>
                          </div>
                        )}
                        {listing.minimum_rental_period && (
                          <div>
                            <span className="font-medium">Minimum Rental Period:</span>
                            <span className="ml-2">{listing.minimum_rental_period}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lease-specific Details */}
                {listing.listing_type?.name === 'For Lease' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Lease Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listing.lease_amount && (
                          <div>
                            <span className="font-medium">Lease Amount:</span>
                            <span className="ml-2">{formatPrice(listing.lease_amount, listing.currency)}</span>
                          </div>
                        )}
                        {listing.lease_duration && (
                          <div>
                            <span className="font-medium">Lease Duration:</span>
                            <span className="ml-2">{listing.lease_duration}</span>
                          </div>
                        )}
                        {listing.renewal_terms && (
                          <div>
                            <span className="font-medium">Renewal Terms:</span>
                            <span className="ml-2">{listing.renewal_terms}</span>
                          </div>
                        )}
                        {listing.security_deposit && (
                          <div>
                            <span className="font-medium">Security Deposit:</span>
                            <span className="ml-2">{formatPrice(listing.security_deposit, listing.currency)}</span>
                          </div>
                        )}
                        {listing.payment_frequency && (
                          <div>
                            <span className="font-medium">Payment Frequency:</span>
                            <span className="ml-2">{listing.payment_frequency}</span>
                          </div>
                        )}
                        {listing.utilities_included && (
                          <div>
                            <span className="font-medium">Utilities Included:</span>
                            <span className="ml-2">Yes</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {listing.listing_type?.name === 'For Booking' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Rates */}
                        {listing.hourly_rate && (
                          <div>
                            <span className="font-medium">Hourly Rate:</span>
                            <span className="ml-2">{formatPrice(listing.hourly_rate, listing.currency)}</span>
                          </div>
                        )}
                        {listing.daily_rate && (
                          <div>
                            <span className="font-medium">Daily Rate:</span>
                            <span className="ml-2">{formatPrice(listing.daily_rate, listing.currency)}</span>
                          </div>
                        )}
                        {listing.weekly_rate && (
                          <div>
                            <span className="font-medium">Weekly Rate:</span>
                            <span className="ml-2">{formatPrice(listing.weekly_rate, listing.currency)}</span>
                          </div>
                        )}
                        {/* Check-in/Check-out Times */}
                        {listing.check_in_time && (
                          <div>
                            <span className="font-medium">Check-in Time:</span>
                            <span className="ml-2">{listing.check_in_time}</span>
                          </div>
                        )}
                        {listing.check_out_time && (
                          <div>
                            <span className="font-medium">Check-out Time:</span>
                            <span className="ml-2">{listing.check_out_time}</span>
                          </div>
                        )}
                        {/* Duration Limits */}
                        {listing.minimum_stay_duration && (
                          <div>
                            <span className="font-medium">Minimum Stay Duration:</span>
                            <span className="ml-2">{listing.minimum_stay_duration} days</span>
                          </div>
                        )}
                        {listing.maximum_stay_duration && (
                          <div>
                            <span className="font-medium">Maximum Stay Duration:</span>
                            <span className="ml-2">{listing.maximum_stay_duration} days</span>
                          </div>
                        )}
                        {/* Commercial booking fields */}
                        {listing.minimum_booking_duration && (
                          <div>
                            <span className="font-medium">Minimum Booking Duration:</span>
                            <span className="ml-2">{listing.minimum_booking_duration} hours</span>
                          </div>
                        )}
                        {listing.maximum_booking_duration && (
                          <div>
                            <span className="font-medium">Maximum Booking Duration:</span>
                            <span className="ml-2">{listing.maximum_booking_duration} hours</span>
                          </div>
                        )}
                        {/* Policies and Fees */}
                        {listing.cancellation_policy && (
                          <div>
                            <span className="font-medium">Cancellation Policy:</span>
                            <span className="ml-2">{listing.cancellation_policy}</span>
                          </div>
                        )}
                        {listing.caution_fee && (
                          <div>
                            <span className="font-medium">Caution Fee:</span>
                            <span className="ml-2">{formatPrice(listing.caution_fee, listing.currency)}</span>
                          </div>
                        )}
                      </div>
                      {listing.services_included && listing.services_included.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">Services Included:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {listing.services_included.map((service, index) => (
                              <Badge key={index} variant="secondary">{service}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Amenities & Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary">{amenity}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Availability */}
                {(listing.available_from || listing.available_to) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listing.available_from && (
                          <div>
                            <span className="font-medium">Available From:</span>
                            <span className="ml-2">{new Date(listing.available_from).toLocaleDateString()}</span>
                          </div>
                        )}
                        {listing.available_to && (
                          <div>
                            <span className="font-medium">Available To:</span>
                            <span className="ml-2">{new Date(listing.available_to).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Information - Hidden for Privacy
                     Contact is handled through Mipripity engagement system */}

                {/* Last Updated */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-500 text-center">
                      Last updated: {new Date(listing.updated_at).toLocaleDateString()} at {new Date(listing.updated_at).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'location' && (
              <Card>
                <CardContent className="p-6">
                  <Map address={listing.location} height="400px" />
                </CardContent>
              </Card>
            )}

            {activeTab === 'reviews' && (
              <Card>
                <CardHeader>
                  <CardTitle>Reviews & Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-gray-500">No reviews yet for this property.</p>
                    <p className="text-sm text-gray-400 mt-2">Be the first to leave a review!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Engagement Card */}
          <Card>
            <CardHeader>
              <CardTitle>Engage with Mipripity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Connect with our team to discuss this property. We'll mediate between you and the lister to ensure a smooth transaction.
              </p>

              <Dialog open={isEngagementOpen} onOpenChange={setIsEngagementOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule a Meeting</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Your Name"
                      value={engagementForm.name}
                      onChange={(e) => setEngagementForm({ ...engagementForm, name: e.target.value })}
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={engagementForm.email}
                      onChange={(e) => setEngagementForm({ ...engagementForm, email: e.target.value })}
                    />
                    <Input
                      placeholder="Your Phone"
                      value={engagementForm.phone}
                      onChange={(e) => setEngagementForm({ ...engagementForm, phone: e.target.value })}
                    />
                    <Textarea
                      placeholder="Your intention towards this property..."
                      value={engagementForm.intention}
                      onChange={(e) => setEngagementForm({ ...engagementForm, intention: e.target.value })}
                      rows={3}
                    />
                    <Select
                      value={engagementForm.meeting_type}
                      onValueChange={(value) => setEngagementForm({ ...engagementForm, meeting_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call Meeting</SelectItem>
                        <SelectItem value="physical">Physical Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      placeholder="Preferred Date"
                      value={engagementForm.scheduled_date}
                      onChange={(e) => setEngagementForm({ ...engagementForm, scheduled_date: e.target.value })}
                    />
                    <Input
                      type="time"
                      placeholder="Preferred Time"
                      value={engagementForm.scheduled_time}
                      onChange={(e) => setEngagementForm({ ...engagementForm, scheduled_time: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleEngagement} className="flex-1">
                        Submit Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEngagementOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Property Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Property Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">
                  {getPropertyPrice(listing)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span>{listing.property_type?.name || 'Property'}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span>{listing.category?.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Property ID:</span>
                <span>#{listing.id.slice(-8)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Properties */}
      {relatedListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((relatedListing) => (
                <div key={relatedListing.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={relatedListing.images?.[0]?.image_url || '/api/placeholder/400/300'}
                      alt={relatedListing.title || 'Property'}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-1">
                      {relatedListing.title}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{relatedListing.location}</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {getPropertyPrice(relatedListing)}
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/marketplace/${relatedListing.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Virtual Tour Viewer */}
      <VirtualTourViewer
        tourData={virtualTourData}
        isOpen={showVirtualTour}
        onClose={() => setShowVirtualTour(false)}
      />
      
      {/* Image Tour Viewer */}
      <ImageTourViewer
        images={images}
        isOpen={showImageTour}
        onClose={() => setShowImageTour(false)}
      />
    </div>
  );
}
