'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Upload, Users, Coins, Calendar, MapPin, Camera, Video, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';

interface CrowdFundingProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  features: string[];
  status: string;
  target_amount: number;
  current_amount: number;
  min_contribution: number;
  max_contribution?: number;
  deadline: string;
  created_at: string;
  media: CrowdFundingMedia[];
  category: { name: string };
  invitations?: Invitation[];
  contributions?: Contribution[];
}

interface CrowdFundingMedia {
  id: string;
  media_url: string;
  media_type: string;
  is_primary: boolean;
}

interface Invitation {
  id: string;
  invitee_id: string;
  invitee_email: string;
  invitee_phone: string;
  status: string;
  invited_at: string;
  contact?: Contact;
}

interface Contribution {
  id: string;
  contributor_id: string;
  invitation_id?: string;
  amount: number;
  contribution_percentage: number;
  payment_status: string;
  payment_reference?: string;
  contributed_at: string;
  contributor?: Contact;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

function CrowdFundingDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { user } = useAuth();
  const [property, setProperty] = useState<CrowdFundingProperty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/crowd-funding/${propertyId}`);
      const result = await response.json();

      if (result.success) {
        setProperty(result.data);
      } else {
        toast.error('Failed to fetch property details');
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (amount: number, target: number) => {
    return Math.round((amount / target) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-l-green-500';
      case 'funded': return 'bg-blue-100 text-blue-800 border-l-blue-500';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-l-yellow-500';
      case 'cancelled': return 'bg-red-100 text-red-800 border-l-red-500';
      default: return 'bg-gray-100 text-gray-800 border-l-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'funded': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <Calendar className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/crowd-funding')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/crowd-funding/${propertyId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{property.title}</h1>
                <p className="text-sm text-gray-600">Property Details</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(property.status)} text-sm`}>
              {getStatusIcon(property.status)}
              <span className="ml-1 capitalize">{property.status}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Property Status Banner */}
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6 px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(property.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Property Status</h3>
                    <Badge variant="outline" className="text-sm border-gray-300 text-gray-700 mt-1">
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {calculatePercentage(property.current_amount, property.target_amount)}%
                  </div>
                  <div className="text-sm text-gray-600">Funding Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-gray-200">
              <CardContent className="pt-4 px-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                    <Coins className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {formatCurrency(property.current_amount)}
                    </p>
                    <p className="text-xs text-gray-600 truncate">Amount Raised</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-4 px-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {formatCurrency(property.target_amount)}
                    </p>
                    <p className="text-xs text-gray-600 truncate">Target Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-4 px-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {property.contributions?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600 truncate">Contributors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-4 px-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {new Date(property.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-600 truncate">Deadline</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Visualization */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4 text-gray-500" />
                Funding Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Property Progress</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {calculatePercentage(property.current_amount, property.target_amount)}% Complete
                  </span>
                </div>
                <div className="relative">
                  <Progress
                    value={calculatePercentage(property.current_amount, property.target_amount)}
                    className="h-4 bg-gray-200"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{formatCurrency(property.current_amount)} raised</span>
                    <span>{formatCurrency(property.target_amount)} target</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Information */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="text-gray-700 leading-relaxed text-sm">{property.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Location</Label>
                    <p className="text-gray-900 font-medium text-sm">{property.location}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Price</Label>
                    <p className="text-gray-900 font-medium text-sm">{formatCurrency(property.price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <p className="text-gray-900 font-medium text-sm">{property.category?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <p className="text-gray-900 font-medium text-sm capitalize">{property.status}</p>
                  </div>
                </div>

                {property.features && property.features.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Features</Label>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature) => (
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contribution Details */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Coins className="h-4 w-4 text-gray-500" />
                  Contribution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Target Amount</Label>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(property.target_amount)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Min Contribution</Label>
                      <p className="text-base font-semibold text-gray-900">{formatCurrency(property.min_contribution)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Max Contribution</Label>
                      <p className="text-base font-semibold text-gray-900">
                        {property.max_contribution ? formatCurrency(property.max_contribution) : 'No limit'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Current Contributors</Label>
                      <p className="text-base font-semibold text-gray-900">{property.contributions?.length || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Funding Deadline</Label>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(property.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Media Gallery */}
          {property.media && property.media.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-500" />
                  Property Media Gallery
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {property.media.length} media file{property.media.length !== 1 ? 's' : ''} uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.media.map((media) => (
                    <div key={media.id} className="group relative">
                      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                        {media.media_type === 'image' ? (
                          <img
                            src={media.media_url}
                            alt="Property media"
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => window.open(media.media_url, '_blank')}
                          />
                        ) : (
                          <video
                            src={media.media_url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(media.media_url, '_blank')}
                          className="bg-white/90 hover:bg-white text-gray-700 text-xs"
                        >
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CrowdFundingDetailsPage() {
  return (
    <ProtectedRoute>
      <CrowdFundingDetailsPageContent />
    </ProtectedRoute>
  );
}