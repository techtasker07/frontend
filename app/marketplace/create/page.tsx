'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface FormData {
  // Basic Information
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  country: string;

  // Property Type and Category
  listing_type_id: string;
  property_type_id: string;
  category_id: string;

  // Pricing Information
  price: string;
  currency: string;
  price_period: string;

  // Property Details
  property_condition: string;
  property_size: string;
  area_sqft: string;
  area_sqm: string;
  year_of_construction: string;

  // Residential Fields
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  kitchen_size: string;
  dining_room: boolean;
  balcony_terrace: boolean;
  furnishing_status: string;
  parking_spaces: string;
  pet_friendly: boolean;

  // Contact Information
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  contact_whatsapp: string;

  // General Fields
  amenities: string[];
  keywords: string[];
}

const initialFormData: FormData = {
  title: '', description: '', location: '', city: '', state: '', country: 'Nigeria',
  listing_type_id: '', property_type_id: '', category_id: '', price: '', currency: 'NGN',
  price_period: '', property_condition: '', property_size: '', area_sqft: '', area_sqm: '',
  year_of_construction: '', bedrooms: '', bathrooms: '', toilets: '', kitchen_size: '',
  dining_room: false, balcony_terrace: false, furnishing_status: '', parking_spaces: '',
  pet_friendly: false, contact_name: '', contact_phone: '', contact_email: '', contact_whatsapp: '',
  amenities: [], keywords: []
};

export default function CreateMarketplacePropertyPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [categories, setCategories] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [listingTypes, setListingTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, propertyTypesRes, listingTypesRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('property_types').select('*'),
        supabase.from('listing_types').select('*')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (propertyTypesRes.data) setPropertyTypes(propertyTypesRes.data);
      if (listingTypesRes.data) setListingTypes(listingTypesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // Fallback data
      setCategories([
        { id: 'residential', name: 'Residential' },
        { id: 'commercial', name: 'Commercial' },
        { id: 'land', name: 'Land' }
      ]);
      setListingTypes([
        { id: 'sale', name: 'For Sale' },
        { id: 'rent', name: 'For Rent' },
        { id: 'lease', name: 'For Lease' },
        { id: 'booking', name: 'For Booking' }
      ]);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Clear property type when category changes
      if (field === 'category_id' && value !== prev.category_id) {
        newData.property_type_id = '';
      }

      return newData;
    });
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      handleInputChange('amenities', [...formData.amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    const newAmenities = formData.amenities.filter((_, i) => i !== index);
    handleInputChange('amenities', newAmenities);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      handleInputChange('keywords', [...formData.keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = formData.keywords.filter((_, i) => i !== index);
    handleInputChange('keywords', newKeywords);
  };

  const validateForm = (): boolean => {
    return !!(
      formData.title &&
      formData.description &&
      formData.location &&
      formData.category_id &&
      formData.property_type_id &&
      formData.listing_type_id &&
      formData.price
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a listing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare submission data
      const submissionData: any = {
        ...formData,
        user_id: user.id, // Use user from auth context
        price: parseFloat(formData.price),
        area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : null,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
        year_of_construction: formData.year_of_construction ? parseInt(formData.year_of_construction) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        toilets: formData.toilets ? parseInt(formData.toilets) : null,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
      };

      console.log('Submitting marketplace listing:', submissionData);

      const { data, error: insertError } = await supabase
        .from('marketplace_listings')
        .insert(submissionData)
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      toast.success('Property listed successfully!');
      router.push(`/marketplace/${data.id}`);

    } catch (error: any) {
      console.error('Submission error:', error);
      setError(error.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const filteredPropertyTypes = propertyTypes.filter(type => type.category_id === formData.category_id);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You must be logged in to create a marketplace listing.</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">
          Logged in as: {user?.first_name} {user?.last_name}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Marketplace Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Modern 3-bedroom apartment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Victoria Island, Lagos"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of the property..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Lagos"
                />
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="e.g., Lagos State"
                />
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="e.g., Nigeria"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Property Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Classification</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Property Type *</Label>
                <Select
                  value={formData.property_type_id}
                  onValueChange={(value) => handleInputChange('property_type_id', value)}
                  disabled={!formData.category_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.category_id ? "Select property type" : "Select a category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPropertyTypes.length > 0 ? (
                      filteredPropertyTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-options" disabled>
                        {formData.category_id ? "No property types available" : "Please select a category first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Listing Type *</Label>
                <Select value={formData.listing_type_id} onValueChange={(value) => handleInputChange('listing_type_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price Period</Label>
                <Select value={formData.price_period} onValueChange={(value) => handleInputChange('price_period', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time (Sale)</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="hour">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property Condition</Label>
                <Select value={formData.property_condition} onValueChange={(value) => handleInputChange('property_condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="needs_renovation">Needs Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year of Construction</Label>
                <Input
                  type="number"
                  value={formData.year_of_construction}
                  onChange={(e) => handleInputChange('year_of_construction', e.target.value)}
                  placeholder="e.g., 2020"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Property Size (Description)</Label>
                <Input
                  value={formData.property_size}
                  onChange={(e) => handleInputChange('property_size', e.target.value)}
                  placeholder="e.g., Large, Spacious"
                />
              </div>

              <div className="space-y-2">
                <Label>Area (sqft)</Label>
                <Input
                  type="number"
                  value={formData.area_sqft}
                  onChange={(e) => handleInputChange('area_sqft', e.target.value)}
                  placeholder="e.g., 1200"
                />
              </div>

              <div className="space-y-2">
                <Label>Area (sqm)</Label>
                <Input
                  type="number"
                  value={formData.area_sqm}
                  onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                  placeholder="e.g., 111"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Residential Details */}
          {formData.category_id === 'residential' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Residential Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    placeholder="e.g., 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Toilets</Label>
                  <Input
                    type="number"
                    value={formData.toilets}
                    onChange={(e) => handleInputChange('toilets', e.target.value)}
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kitchen Size</Label>
                  <Input
                    value={formData.kitchen_size}
                    onChange={(e) => handleInputChange('kitchen_size', e.target.value)}
                    placeholder="e.g., Large"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Furnishing Status</Label>
                  <Select value={formData.furnishing_status} onValueChange={(value) => handleInputChange('furnishing_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parking Spaces</Label>
                  <Input
                    type="number"
                    value={formData.parking_spaces}
                    onChange={(e) => handleInputChange('parking_spaces', e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pet_friendly"
                    checked={formData.pet_friendly}
                    onChange={(e) => handleInputChange('pet_friendly', e.target.checked)}
                  />
                  <Label htmlFor="pet_friendly">Pet Friendly</Label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dining_room"
                    checked={formData.dining_room}
                    onChange={(e) => handleInputChange('dining_room', e.target.checked)}
                  />
                  <Label htmlFor="dining_room">Dining Room</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="balcony_terrace"
                    checked={formData.balcony_terrace}
                    onChange={(e) => handleInputChange('balcony_terrace', e.target.checked)}
                  />
                  <Label htmlFor="balcony_terrace">Balcony/Terrace</Label>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Your name or business name"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="e.g., +234 XXX XXX XXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input
                  value={formData.contact_whatsapp}
                  onChange={(e) => handleInputChange('contact_whatsapp', e.target.value)}
                  placeholder="e.g., +234 XXX XXX XXXX"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Amenities and Keywords */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Amenities & Keywords</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Add amenity"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAmenity();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addAmenity}>
                    Add
                  </Button>
                </div>
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, index) => (
                      <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addKeyword}>
                    Add
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading || !validateForm()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}