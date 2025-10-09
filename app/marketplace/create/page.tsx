'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabaseApi, Category, PropertyType, ListingType } from '@/lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { VirtualTourUpload, type VirtualTourUploadData } from '@/components/virtual-tour/VirtualTourUpload';

interface FormData {
  // Basic Information
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  country: string;
  
  // Property Details
  listing_type_id: string;
  property_type_id: string;
  category_id: string;
  price: string;
  currency: string;
  price_period: string;
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
  appliances_included: string[];
  security_features: string[];
  neighbourhood_features: string[];
  
  // Commercial Fields
  property_usage_type: string;
  total_floors: string;
  floor_number: string;
  office_rooms: string;
  conference_rooms: string;
  internet_available: boolean;
  power_supply: string;
  loading_dock: boolean;
  storage_space: string;
  accessibility_features: string[];
  fire_safety_features: string[];
  
  // Land Fields
  land_type: string;
  title_document: string;
  topography: string;
  water_access: boolean;
  electricity_access: boolean;
  fence_boundary_status: string;
  road_access: boolean;
  soil_type: string;
  proximity_to_amenities: string[];
  
  // Rent-specific Fields
  monthly_rent_amount: string;
  security_deposit: string;
  utilities_included: boolean;
  payment_frequency: string;
  minimum_rental_period: string;
  
  // Lease-specific Fields
  lease_amount: string;
  lease_duration: string;
  renewal_terms: string;
  
  // Booking-specific Fields
  hourly_rate: string;
  daily_rate: string;
  weekly_rate: string;
  check_in_time: string;
  check_out_time: string;
  minimum_stay_duration: string;
  maximum_stay_duration: string;
  minimum_booking_duration: string;
  maximum_booking_duration: string;
  cancellation_policy: string;
  caution_fee: string;
  services_included: string[];
  
  // General Fields
  available_from: string;
  available_to: string;
  amenities: string[];
  keywords: string[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  contact_whatsapp: string;
  virtual_tour_url: string;
  video_url: string;
}

const initialFormData: FormData = {
  title: '', description: '', location: '', city: '', state: '', country: 'Nigeria',
  listing_type_id: '', property_type_id: '', category_id: '', price: '', currency: 'NGN',
  price_period: '', property_condition: '', property_size: '', area_sqft: '', area_sqm: '',
  year_of_construction: '', bedrooms: '', bathrooms: '', toilets: '', kitchen_size: '',
  dining_room: false, balcony_terrace: false, furnishing_status: '', parking_spaces: '',
  pet_friendly: false, appliances_included: [], security_features: [], neighbourhood_features: [],
  property_usage_type: '', total_floors: '', floor_number: '', office_rooms: '',
  conference_rooms: '', internet_available: false, power_supply: '', loading_dock: false,
  storage_space: '', accessibility_features: [], fire_safety_features: [], land_type: '',
  title_document: '', topography: '', water_access: false, electricity_access: false,
  fence_boundary_status: '', road_access: false, soil_type: '', proximity_to_amenities: [],
  monthly_rent_amount: '', security_deposit: '', utilities_included: false, payment_frequency: '',
  minimum_rental_period: '', lease_amount: '', lease_duration: '', renewal_terms: '',
  hourly_rate: '', daily_rate: '', weekly_rate: '', check_in_time: '', check_out_time: '',
  minimum_stay_duration: '', maximum_stay_duration: '', minimum_booking_duration: '',
  maximum_booking_duration: '', cancellation_policy: '', caution_fee: '', services_included: [],
  available_from: '', available_to: '', amenities: [], keywords: [], contact_name: '',
  contact_phone: '', contact_email: '', contact_whatsapp: '', virtual_tour_url: '', video_url: ''
};

export default function CreateMarketplacePropertyPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [virtualTourData, setVirtualTourData] = useState<VirtualTourUploadData | null>(null);
  const [amenities, setAmenities] = useState<Record<string, any[]>>({});
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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
      const [categoriesRes, propertyTypesRes, listingTypesRes, amenitiesRes] = await Promise.all([
        supabaseApi.getCategories(),
        supabaseApi.getPropertyTypes(),
        supabaseApi.getListingTypes(),
        supabaseApi.getAmenities()
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (propertyTypesRes.success) setPropertyTypes(propertyTypesRes.data);
      if (listingTypesRes.success) setListingTypes(listingTypesRes.data);
      if (amenitiesRes.success) setAmenities(amenitiesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // Provide fallback data if database tables don't exist
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
      setAmenities({
        'General': [
          { id: 'wifi', name: 'WiFi', category: 'General' },
          { id: 'security', name: 'Security', category: 'General' },
          { id: 'generator', name: 'Generator', category: 'General' }
        ]
      });
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

  const handleAmenityToggle = (amenityName: string) => {
    setSelectedAmenities(prev => {
      const newSelected = prev.includes(amenityName)
        ? prev.filter(name => name !== amenityName)
        : [...prev, amenityName];

      // Update form data
      setFormData(prev => ({ ...prev, amenities: newSelected }));
      return newSelected;
    });
  };

  const addTag = (field: keyof FormData, value: string) => {
    if (value.trim() && !((formData[field] as string[])?.includes(value.trim()))) {
      handleInputChange(field, [...((formData[field] as string[]) || []), value.trim()]);
    }
  };

  const removeTag = (field: keyof FormData, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    handleInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.description && formData.location && 
                  formData.category_id && formData.property_type_id && formData.listing_type_id);
      case 2:
        return !!formData.price;
      case 3:
        return true; // Category-specific fields are optional
      case 4:
        return true; // Function-specific fields are optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create a clean submission data object, excluding empty strings for date/time fields
      const submissionData: any = {
        ...formData,
        price: parseFloat(formData.price),
        area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : undefined,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : undefined,
        year_of_construction: formData.year_of_construction ? parseInt(formData.year_of_construction) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        toilets: formData.toilets ? parseInt(formData.toilets) : undefined,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : undefined,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : undefined,
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : undefined,
        office_rooms: formData.office_rooms ? parseInt(formData.office_rooms) : undefined,
        conference_rooms: formData.conference_rooms ? parseInt(formData.conference_rooms) : undefined,
        monthly_rent_amount: formData.monthly_rent_amount ? parseFloat(formData.monthly_rent_amount) : undefined,
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : undefined,
        lease_amount: formData.lease_amount ? parseFloat(formData.lease_amount) : undefined,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : undefined,
        weekly_rate: formData.weekly_rate ? parseFloat(formData.weekly_rate) : undefined,
        minimum_stay_duration: formData.minimum_stay_duration ? parseInt(formData.minimum_stay_duration) : undefined,
        maximum_stay_duration: formData.maximum_stay_duration ? parseInt(formData.maximum_stay_duration) : undefined,
        minimum_booking_duration: formData.minimum_booking_duration ? parseInt(formData.minimum_booking_duration) : undefined,
        maximum_booking_duration: formData.maximum_booking_duration ? parseInt(formData.maximum_booking_duration) : undefined,
        caution_fee: formData.caution_fee ? parseFloat(formData.caution_fee) : undefined,
      };

      // Only include date/time fields if they have actual values
      if (formData.available_from) submissionData.available_from = formData.available_from;
      if (formData.available_to) submissionData.available_to = formData.available_to;
      if (formData.check_in_time) submissionData.check_in_time = formData.check_in_time;
      if (formData.check_out_time) submissionData.check_out_time = formData.check_out_time;

      console.log('Submitting marketplace listing with data:', submissionData);

      const response = await supabaseApi.createMarketplaceListing(submissionData);

      if (response.success) {
        toast.success('Property listed successfully!');
        router.push(`/marketplace/${response.data.id}`);
      } else {
        console.error('Marketplace listing creation failed:', response.error);
        // Check if it's a database table error
        if (response.error?.includes('marketplace_listings') && response.error?.includes('does not exist')) {
          setError('Marketplace functionality is not available. Database tables need to be set up. Please contact support or run the database setup scripts.');
        } else if (response.error?.includes('invalid input syntax for type')) {
          // Extract the specific field causing the type error
          const typeMatch = response.error.match(/invalid input syntax for type (\w+): "([^"]*)"/);
          if (typeMatch) {
            const fieldType = typeMatch[1];
            const fieldValue = typeMatch[2];
            setError(`Invalid ${fieldType} value: "${fieldValue}". Please check your input or leave the field empty if not required.`);
          } else {
            setError(`Database type error: ${response.error}`);
          }
        } else {
          setError(response.error || 'Failed to create listing');
        }
      }
    } catch (error: any) {
      console.error('Marketplace listing creation error:', error);
      // Check if it's a database table error
      if (error.message?.includes('marketplace_listings') && error.message?.includes('does not exist')) {
        setError('Marketplace functionality is not available. Database tables need to be set up. Please contact support or run the database setup scripts.');
      } else if (error.message?.includes('invalid input syntax for type')) {
        // Extract the specific field causing the type error
        const typeMatch = error.message.match(/invalid input syntax for type (\w+): "([^"]*)"/);
        if (typeMatch) {
          const fieldType = typeMatch[1];
          const fieldValue = typeMatch[2];
          setError(`Invalid ${fieldType} value: "${fieldValue}". Please check your input or leave the field empty if not required.`);
        } else {
          setError(`Database type error: ${error.message}`);
        }
      } else {
        setError(error.message || 'Failed to create listing');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);
  const selectedListingType = listingTypes.find(type => type.id === formData.listing_type_id);

  // Fallback property types for when database is not populated
  const fallbackPropertyTypes: { [key: string]: PropertyType[] } = {
    'Residential': [
      { id: 'res-apartment', name: 'Apartment', category_id: '' },
      { id: 'res-house', name: 'House', category_id: '' },
      { id: 'res-villa', name: 'Villa', category_id: '' },
      { id: 'res-duplex', name: 'Duplex', category_id: '' },
      { id: 'res-studio', name: 'Studio', category_id: '' }
    ],
    'Commercial': [
      { id: 'com-office', name: 'Office Space', category_id: '' },
      { id: 'com-retail', name: 'Retail Shop', category_id: '' },
      { id: 'com-restaurant', name: 'Restaurant', category_id: '' },
      { id: 'com-warehouse', name: 'Warehouse', category_id: '' }
    ],
    'Land': [
      { id: 'land-residential', name: 'Residential Land', category_id: '' },
      { id: 'land-commercial', name: 'Commercial Land', category_id: '' },
      { id: 'land-agricultural', name: 'Agricultural Land', category_id: '' }
    ]
  };

  const filteredPropertyTypes = propertyTypes.filter(type => type.category_id === formData.category_id);
  const fallbackTypes = selectedCategory ? fallbackPropertyTypes[selectedCategory.name] || [] : [];
  const displayPropertyTypes = filteredPropertyTypes.length > 0 ? filteredPropertyTypes : fallbackTypes;


  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Property Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Modern 3-bedroom apartment in Victoria Island"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {displayPropertyTypes.length > 0 ? (
                displayPropertyTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  {formData.category_id ? "No property types available for this category" : "Please select a category first"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {formData.category_id && filteredPropertyTypes.length === 0 && displayPropertyTypes.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Using default property types. Database may not be fully configured.
            </p>
          )}
          {formData.category_id && displayPropertyTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No property types are available for the selected category. Please contact support.
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Function *</Label>
          <Select value={formData.listing_type_id} onValueChange={(value) => handleInputChange('listing_type_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Function" />
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
  );

  const renderPriceAndDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
  );

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
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Create Marketplace Listing
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Step {step} of 5</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              {renderBasicInfo()}
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing & Property Details</h3>
              {renderPriceAndDetails()}
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Property Images & Virtual Tour</h3>
              <div className="space-y-6">
                {/* Regular Images Upload */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Property Images</Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        // Handle regular image uploads here
                        console.log('Regular images:', e.target.files);
                      }}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload high-quality photos of your property. First image will be the primary image.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Virtual Tour Upload */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold mb-2">Virtual Tour (Optional)</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create an immersive 360° virtual tour to help buyers explore your property remotely.
                    </p>
                    <VirtualTourUpload
                      onTourDataChange={setVirtualTourData}
                      initialData={virtualTourData || undefined}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Details & Amenities</h3>
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <Separator />

                {/* Amenities */}
                <div className="space-y-4">
                  <Label>Amenities & Features</Label>
                  <div className="space-y-4">
                    {Object.entries(amenities).map(([category, categoryAmenities]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 capitalize">
                          {category.replace('_', ' ')}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {categoryAmenities.map((amenity: any) => (
                            <div key={amenity.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`amenity-${amenity.id}`}
                                checked={selectedAmenities.includes(amenity.name)}
                                onCheckedChange={() => handleAmenityToggle(amenity.name)}
                              />
                              <Label
                                htmlFor={`amenity-${amenity.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {amenity.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom amenities section */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="text-sm font-medium">Additional Amenities</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add custom amenity"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTag.trim()) {
                              addTag('amenities', newTag);
                              setNewTag('');
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (newTag.trim()) {
                            addTag('amenities', newTag);
                            setNewTag('');
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.amenities.filter(amenity => !Object.values(amenities).flat().some((a: any) => a.name === amenity)).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.amenities.filter(amenity => !Object.values(amenities).flat().some((a: any) => a.name === amenity)).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {amenity}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag('amenities', index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Review & Publish</h3>
              <div className="space-y-6">
                <Alert>
                  <AlertDescription>
                    Please review your listing details before publishing. You can edit these details later if needed.
                  </AlertDescription>
                </Alert>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Listing Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <strong>Title:</strong> {formData.title}
                      </div>
                      <div>
                        <strong>Location:</strong> {formData.location}
                      </div>
                      <div>
                        <strong>Price:</strong> {formData.currency} {parseInt(formData.price || '0').toLocaleString()}{formData.price_period && ` / ${formData.price_period}`}
                      </div>
                      <div>
                        <strong>Category:</strong> {categories.find(c => c.id === formData.category_id)?.name}
                      </div>
                      <div>
                        <strong>Property Type:</strong> {propertyTypes.find(p => p.id === formData.property_type_id)?.name}
                      </div>
                      <div>
                        <strong>Function:</strong> {listingTypes.find(l => l.id === formData.listing_type_id)?.name}
                      </div>
                      {virtualTourData && virtualTourData.scenes.length > 0 && (
                        <div>
                          <strong>Virtual Tour:</strong> ✅ {virtualTourData.scenes.length} scenes configured
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div className="flex justify-between pt-6">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrev}>
                Previous
              </Button>
            )}
            
            <div className="ml-auto flex space-x-2">
              {step < 5 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    'Create Listing'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
