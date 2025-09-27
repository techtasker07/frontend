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
import { supabaseApi, Property } from '@/lib/supabase-api';
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
  Vote
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MarketPropertyDetailsPage() {
  const params = useParams();
  const [listing, setListing] = useState<Property | null>(null);
  const [relatedListings, setRelatedListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'location' | 'reviews'>('overview');

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    booking_type: 'viewing',
    start_date: '',
    end_date: '',
    guest_count: 1,
    message: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchListingDetails();
    }
  }, [params.id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await supabaseApi.getProperty(params.id as string);

      if (response.success) {
        setListing(response.data);

        // Fetch related properties based on same category or location
        const relatedResponse = await supabaseApi.getProperties({
          category: response.data.category_name,
          limit: 4
        });

        if (relatedResponse.success) {
          // Filter out the current property from related listings
          const filtered = relatedResponse.data.filter(item => item.id !== response.data.id);
          setRelatedListings(filtered.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching listing details:', error);
    } finally {
      setLoading(false);
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

  const getPropertyPrice = (property: Property) => {
    if (property.current_worth) {
      return formatPrice(property.current_worth);
    }
    return 'Price on request';
  };

  const handleInquiry = async () => {
    // Here you would typically send the inquiry to your backend
    console.log('Inquiry submitted:', inquiryForm);
    setIsInquiryOpen(false);
    setInquiryForm({ name: '', email: '', phone: '', message: '' });
  };

  const handleBooking = async () => {
    try {
      if (!listing) return;
      
      const response = await supabaseApi.createBooking({
        marketplace_listing_id: listing.id,
        booking_type: bookingForm.booking_type,
        start_date: bookingForm.start_date || undefined,
        end_date: bookingForm.end_date || undefined,
        guest_count: bookingForm.guest_count,
        message: bookingForm.message || undefined
      });

      if (response.success) {
        setIsBookingOpen(false);
        setBookingForm({
          booking_type: 'viewing',
          start_date: '',
          end_date: '',
          guest_count: 1,
          message: ''
        });
        alert('Booking request submitted successfully!');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to submit booking request');
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

      {/* Image Gallery */}
      <Card className="overflow-hidden">
        <div className="relative aspect-video">
          <Image
            src={images[currentImageIndex]}
            alt={listing.title || 'Property'}
            fill
            className="object-cover"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

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
            <Badge variant="secondary">
              {listing.category_name}
            </Badge>
          </div>
        </div>
      </Card>

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
                  {listing.category_name}
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
              <div className="flex items-center gap-1 text-gray-500">
                <Vote className="h-4 w-4" />
                <span>{listing.vote_count || 0} votes</span>
              </div>
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
                        <span>Category: {listing.category_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'details' && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-2">{listing.category_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">{listing.location}</span>
                      </div>
                      <div>
                        <span className="font-medium">Year Built:</span>
                        <span className="ml-2">{listing.year_of_construction || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium">Price:</span>
                        <span className="ml-2">{getPropertyPrice(listing)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Votes:</span>
                        <span className="ml-2">{listing.vote_count || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span>
                        <span className="ml-2">
                          {new Date(listing.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'location' && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span className="text-lg">{listing.location}</span>
                    </div>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Map integration would go here</p>
                    </div>
                  </div>
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
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Property Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={listing.owner_profile_picture || "/placeholder.svg"} alt={listing.owner_name} />
                  <AvatarFallback className="text-lg">
                    {listing.owner_name
                      ? `${listing.owner_name.split(" ")[0][0]}${listing.owner_name.split(" ")[1]?.[0] || ""}`.toUpperCase()
                      : "PO"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {listing.owner_name || 'Property Owner'}
                  </div>
                  <div className="text-sm text-gray-500">Property Lister</div>
                </div>
              </div>

              <div className="space-y-2">
                {listing.owner_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{listing.owner_phone}</span>
                  </div>
                )}
                {listing.owner_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{listing.owner_email}</span>
                  </div>
                )}
                {listing.lister_phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{listing.lister_phone_number}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {/* Contact Buttons */}
                <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Inquiry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Your Name"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      />
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      />
                      <Input
                        placeholder="Your Phone"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      />
                      <Textarea
                        placeholder="Your message..."
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleInquiry} className="flex-1">
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsInquiryOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Booking Button */}
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Viewing
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book a Viewing</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select
                        value={bookingForm.booking_type}
                        onValueChange={(value) => setBookingForm({ ...bookingForm, booking_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewing">Property Viewing</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          {listing.type === 'booking' && (
                            <SelectItem value="stay">Book Stay</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="date"
                        placeholder="Start Date"
                        value={bookingForm.start_date}
                        onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                      />
                      
                      {bookingForm.booking_type === 'stay' && (
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={bookingForm.end_date}
                          onChange={(e) => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                        />
                      )}
                      
                      <Input
                        type="number"
                        placeholder="Number of Guests"
                        value={bookingForm.guest_count}
                        onChange={(e) => setBookingForm({ ...bookingForm, guest_count: parseInt(e.target.value) || 1 })}
                        min={1}
                      />
                      
                      <Textarea
                        placeholder="Special requests or message..."
                        value={bookingForm.message}
                        onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                        rows={3}
                      />
                      
                      <div className="flex gap-2">
                        <Button onClick={handleBooking} className="flex-1">
                          Submit Request
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsBookingOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
                <span>{listing.type || 'Property'}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span>{listing.category_name}</span>
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
                <Card key={relatedListing.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={relatedListing.images?.[0]?.image_url || '/api/placeholder/400/300'}
                      alt={relatedListing.title || 'Property'}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
