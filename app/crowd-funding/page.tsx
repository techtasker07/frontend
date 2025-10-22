'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Upload, Users, DollarSign, Calendar, MapPin, Camera, Video, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import useSWR from 'swr';

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
  deadline?: string;
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

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
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
  contributed_at: string;
  contributor?: Contact;
}

function CrowdFundingPageContent() {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState<'manage' | 'contribute'>('manage');
   const [loading, setLoading] = useState(false);
   const [selectedProperty, setSelectedProperty] = useState<CrowdFundingProperty | null>(null);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [showContactsModal, setShowContactsModal] = useState(false);
   const [selectedPropertyForContacts, setSelectedPropertyForContacts] = useState<CrowdFundingProperty | null>(null);

   // Form states
   const [formData, setFormData] = useState({
     title: '',
     description: '',
     location: '',
     price: '',
     target_amount: '',
     min_contribution: '1000',
     max_contribution: '',
     deadline: '',
     category_id: '',
     features: [] as string[]
   });

   const [mediaFiles, setMediaFiles] = useState<File[]>([]);
   const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
   const [contributionAmount, setContributionAmount] = useState('');

   // Use SWR for properties
   const { data: properties = [], isLoading: propertiesLoading } = useSWR(
     user ? ['crowd-funding-properties', user.id] : null,
     async ([, userId]) => {
       const { data, error } = await supabase
         .from('crowd_funding_properties')
         .select(`
           *,
           category:categories(name),
           media:crowd_funding_media(*),
           invitations:crowd_funding_invitations(
             id,
             invitee_id,
             invitee_email,
             invitee_phone,
             status,
             invited_at,
             contact:profiles!crowd_funding_invitations_invitee_id_fkey(id, first_name, last_name, email)
           ),
           contributions:crowd_funding_contributions(
             id,
             contributor_id,
             amount,
             contribution_percentage,
             payment_status,
             contributed_at,
             contributor:profiles!crowd_funding_contributions_contributor_id_fkey(id, first_name, last_name, email)
           )
         `)
         .eq('user_id', userId)
         .order('created_at', { ascending: false });

       if (error) throw error;
       return data || [];
     },
     {
       revalidateOnFocus: false,
       revalidateOnReconnect: true,
       dedupingInterval: 30000,
       errorRetryCount: 3,
       errorRetryInterval: 1000,
     }
   );

   // Use SWR for contacts
   const { data: contacts = [] } = useSWR(
     'crowd-funding-contacts',
     async () => {
       const { data: referrals, error: referralsError } = await supabase
         .from('profiles')
         .select('id, first_name, last_name, email, phone_number')
         .neq('id', user?.id);

       if (referralsError) throw referralsError;
       return referrals || [];
     },
     {
       revalidateOnFocus: false,
       revalidateOnReconnect: true,
       dedupingInterval: 300000,
       errorRetryCount: 3,
       errorRetryInterval: 1000,
     }
   );

   // Use SWR for contributions
   const { data: contributionsData } = useSWR(
     user ? ['crowd-funding-contributions', user.id] : null,
     async ([, userId]) => {
       const { data: contributions, error: contributionsError } = await supabase
         .from('crowd_funding_contributions')
         .select(`
           *,
           property:crowd_funding_properties(
             id,
             title,
             description,
             location,
             target_amount,
             current_amount,
             status,
             created_at,
             category:categories(name)
           ),
           invitation:crowd_funding_invitations(
             id,
             status,
             invited_at
           )
         `)
         .eq('contributor_id', userId)
         .order('contributed_at', { ascending: false });

       if (contributionsError) throw contributionsError;

       const { data: invitations, error: invitationsError } = await supabase
         .from('crowd_funding_invitations')
         .select(`
           id,
           status,
           invited_at,
           property:crowd_funding_properties(
             id,
             title,
             description,
             location,
             target_amount,
             current_amount,
             status,
             min_contribution,
             max_contribution,
             deadline,
             created_at,
             category:categories(name)
           )
         `)
         .eq('invitee_id', userId)
         .eq('status', 'accepted')
         .order('invited_at', { ascending: false });

       if (invitationsError) throw invitationsError;

       const contributedPropertyIds = new Set(contributions?.map(c => c.property_id) || []);
       const pendingInvitations = invitations?.filter((inv: any) => inv.property && (inv.property as any).id && !contributedPropertyIds.has((inv.property as any).id)) || [];

       return {
         contributions: contributions || [],
         invitedProperties: pendingInvitations.map((inv: any) => inv.property).filter(Boolean) as CrowdFundingProperty[]
       };
     },
     {
       revalidateOnFocus: false,
       revalidateOnReconnect: true,
       dedupingInterval: 30000,
       errorRetryCount: 3,
       errorRetryInterval: 1000,
     }
   );

   const myContributions = contributionsData?.contributions || [];
   const invitedProperties = contributionsData?.invitedProperties || [];


  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check if payment was completed (payment reference should be set by success redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentRef = urlParams.get('payment_reference');

    if (!paymentRef) {
      toast.error('Payment reference not found. Please complete payment first.');
      return;
    }

    setLoading(true);
    try {
      // Create property
      const { data: property, error: propertyError } = await supabase
        .from('crowd_funding_properties')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price: parseFloat(formData.price),
          target_amount: parseFloat(formData.target_amount),
          min_contribution: parseFloat(formData.min_contribution),
          max_contribution: formData.max_contribution ? parseFloat(formData.max_contribution) : null,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          category_id: formData.category_id,
          features: formData.features,
          user_id: user.id,
          status: 'active',
          payment_reference: paymentRef
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Upload media files
      if (mediaFiles.length > 0) {
        await uploadMediaFiles(property.id);
      }

      // Send invitations
      if (selectedContacts.length > 0) {
        await sendInvitations(property.id);
      }

      toast.success('Crowd funding property created successfully!');
      setFormData({
        title: '',
        description: '',
        location: '',
        price: '',
        target_amount: '',
        min_contribution: '1000',
        max_contribution: '',
        deadline: '',
        category_id: '',
        features: []
      });
      setMediaFiles([]);
      setSelectedContacts([]);
      // Properties will be automatically refetched by SWR when needed
      setActiveTab('manage');
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const uploadMediaFiles = async (propertyId: string) => {
    for (const file of mediaFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('crowd-funding-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('crowd-funding-media')
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      await supabase
        .from('crowd_funding_media')
        .insert({
          property_id: propertyId,
          media_url: publicUrl,
          media_type: mediaType,
          file_name: file.name,
          file_size: file.size,
          is_primary: mediaFiles.indexOf(file) === 0
        });
    }
  };

  const sendInvitations = async (propertyId: string) => {
    const invitations = selectedContacts.map(contactId => {
      const contact = contacts.find(c => c.id === contactId);
      return {
        property_id: propertyId,
        inviter_id: user?.id,
        invitee_id: contactId,
        invitee_email: contact?.email,
        invitee_phone: contact?.phone_number,
        status: 'pending'
      };
    });

    const { error } = await supabase
      .from('crowd_funding_invitations')
      .insert(invitations);

    if (error) throw error;
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-l-green-500';
      case 'funded': return 'bg-blue-100 text-blue-800 border-l-blue-500';
      case 'cancelled': return 'bg-red-100 text-red-800 border-l-red-500';
      default: return 'bg-gray-100 text-gray-800 border-l-gray-500';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-l-green-500';
      case 'funded': return 'border-l-blue-500';
      case 'cancelled': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'funded': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">Crowd Funding</h1>
              <p className="text-xs text-gray-600">Manage campaigns</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-sm px-3">
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline text-xs">Create</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden md:block mb-6 lg:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Crowd Funding</h1>
                <p className="text-sm lg:text-base text-gray-600">
                  Create and manage property crowd funding campaigns with your contacts
                </p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4 md:mb-6 px-3 sm:px-4 md:px-0">
            <TabsTrigger value="manage" className="text-xs sm:text-sm md:text-base py-2 sm:py-3 md:py-2">Manage Campaigns</TabsTrigger>
            <TabsTrigger value="contribute" className="text-xs sm:text-sm md:text-base py-2 sm:py-3 md:py-2">My Contributions</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-3 sm:space-y-4 md:space-y-6 px-3 sm:px-4 md:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {properties.map((property) => (
                <Card key={property.id} className={`hover:shadow-lg transition-shadow border-l-4 ${getStatusBorderColor(property.status)}`}>
                  <CardHeader className="pb-3 px-4 md:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg line-clamp-2 leading-tight">{property.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="text-xs md:text-sm truncate">{property.location}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(property.status)} text-xs md:text-sm ml-2`}>
                        {getStatusIcon(property.status)}
                        <span className="ml-1 capitalize hidden sm:inline">{property.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 md:px-6 pb-4 md:pb-6">
                    <div className="space-y-3 md:space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{calculatePercentage(property.current_amount, property.target_amount)}%</span>
                        </div>
                        <Progress value={calculatePercentage(property.current_amount, property.target_amount)} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{formatCurrency(property.current_amount)}</span>
                          <span>{formatCurrency(property.target_amount)}</span>
                        </div>
                      </div>

                      {/* Media Preview - Only show if media exists */}
                      {property.media && property.media.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm font-medium text-gray-700">Media ({property.media.length})</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {property.media.slice(0, 2).map((media: CrowdFundingMedia) => (
                              <div key={media.id} className="aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                {media.media_type === 'image' ? (
                                  <img
                                    src={media.media_url}
                                    alt="Property media"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Video className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProperty(property)}
                          className="flex-1 text-xs md:text-sm h-9 md:h-10"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPropertyForContacts(property);
                            setShowContactsModal(true);
                          }}
                          className="px-3 md:px-3 h-9 md:h-10"
                        >
                          <Users className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {properties.length === 0 && (
              <Card className="mx-3 sm:mx-4 md:mx-0">
                <CardContent className="text-center py-6 sm:py-8 md:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">
                    Start your first crowd funding campaign to attract investors
                  </p>
                  <Button onClick={() => setShowCreateModal(true)} className="bg-gray-900 hover:bg-gray-800 text-sm sm:text-base">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contribute" className="space-y-4 md:space-y-6 px-4 md:px-0">
            {/* My Contributions Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
                <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  My Contributions
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-gray-600">
                  Properties you've contributed to
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                {myContributions.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Contributions Yet</h3>
                    <p className="text-sm md:text-base text-gray-600">You haven't made any contributions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {myContributions.map((contribution) => (
                      <div key={contribution.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                              <span className="font-semibold text-gray-700 text-sm md:text-base">
                                {contribution.property?.title?.[0] || 'P'}
                              </span>
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-1">{contribution.property?.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{contribution.property?.location}</span>
                                </span>
                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                  {contribution.property?.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="text-left sm:text-right space-y-1">
                            <div className="text-lg md:text-xl font-bold text-gray-900">
                              {formatCurrency(contribution.amount)}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                              {contribution.contribution_percentage?.toFixed(2)}% of target
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(contribution.contributed_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2">
                            <span>Campaign Progress</span>
                            <span>{calculatePercentage(contribution.property?.current_amount || 0, contribution.property?.target_amount || 1)}% funded</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(calculatePercentage(contribution.property?.current_amount || 0, contribution.property?.target_amount || 1), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Invitations Section */}
            {invitedProperties.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
                  <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Pending Invitations
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm text-gray-600">
                    Properties you're invited to contribute to
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  <div className="space-y-3 md:space-y-4">
                    {invitedProperties.map((property) => (
                      <div key={property.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                              <span className="font-semibold text-gray-700 text-sm md:text-base">
                                {property.title?.[0] || 'P'}
                              </span>
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-1">{property.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{property.location}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 flex-shrink-0" />
                                  <span>{formatCurrency(property.target_amount)}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left sm:text-right space-y-2">
                            <div className="text-xs md:text-sm text-gray-600">
                              Min: {formatCurrency(property.min_contribution || 1000)}
                            </div>
                            {property.max_contribution && (
                              <div className="text-xs md:text-sm text-gray-600">
                                Max: {formatCurrency(property.max_contribution)}
                              </div>
                            )}
                            <Button
                              size="sm"
                              onClick={() => setSelectedProperty(property)}
                              className="bg-gray-900 hover:bg-gray-800 text-xs w-full sm:w-auto h-9 md:h-10"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2">
                            <span>Current Progress</span>
                            <span>{calculatePercentage(property.current_amount, property.target_amount)}% funded</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(calculatePercentage(property.current_amount, property.target_amount), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Campaign Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-7xl w-[96vw] sm:w-[90vw] md:w-auto p-3 sm:p-4 md:p-6">
            <DialogHeader className="space-y-2 sm:space-y-3 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold truncate">Create New Campaign</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                    Launch a crowd funding campaign for your property investment
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pt-2">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                <form onSubmit={handleCreateProperty} className="space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Property Information Section */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        Property Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="title" className="text-xs sm:text-sm font-medium text-gray-700">Property Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., 3 Bedroom Apartment in Lekki"
                            className="h-9 sm:h-10 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="location" className="text-xs sm:text-sm font-medium text-gray-700">Location *</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g., Lekki Phase 1, Lagos"
                            className="h-9 sm:h-10 text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="description" className="text-xs sm:text-sm font-medium text-gray-700">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the property, its potential, and why it's a good investment opportunity..."
                          rows={3}
                          className="resize-none text-sm"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="price" className="text-xs sm:text-sm font-medium text-gray-700">Property Value (₦) *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="50000000"
                            className="h-9 sm:h-10 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="category" className="text-xs sm:text-sm font-medium text-gray-700">Property Type *</Label>
                          <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                            <SelectTrigger className="h-9 sm:h-10 text-sm">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="550e8400-e29b-41d4-a716-446655440001">Residential</SelectItem>
                              <SelectItem value="550e8400-e29b-41d4-a716-446655440002">Commercial</SelectItem>
                              <SelectItem value="550e8400-e29b-41d4-a716-446655440003">Land</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Funding Configuration Section */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        Funding Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="target_amount" className="text-xs sm:text-sm font-medium text-gray-700">Target Amount (₦) *</Label>
                        <Input
                          id="target_amount"
                          type="number"
                          value={formData.target_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                          placeholder="10000000"
                          className="h-9 sm:h-10 text-sm"
                          required
                        />
                        <p className="text-xs text-gray-500">The total amount you want to raise for this property</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="min_contribution" className="text-xs sm:text-sm font-medium text-gray-700">Min Contribution (₦)</Label>
                          <Input
                            id="min_contribution"
                            type="number"
                            value={formData.min_contribution}
                            onChange={(e) => setFormData(prev => ({ ...prev, min_contribution: e.target.value }))}
                            placeholder="1000"
                            className="h-9 sm:h-10 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="max_contribution" className="text-xs sm:text-sm font-medium text-gray-700">Max Contribution (₦)</Label>
                          <Input
                            id="max_contribution"
                            type="number"
                            value={formData.max_contribution}
                            onChange={(e) => setFormData(prev => ({ ...prev, max_contribution: e.target.value }))}
                            placeholder="Optional"
                            className="h-9 sm:h-10 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="deadline" className="text-xs sm:text-sm font-medium text-gray-700">Campaign Deadline</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                            className="h-9 sm:h-10 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Property Features Section */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        Property Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        {['Swimming Pool', 'Gym', 'Parking', 'Security', 'Generator', 'Water Treatment', 'Elevator', 'Balcony'].map((feature) => (
                          <div key={feature} className="flex items-center space-x-2 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Checkbox
                              id={feature}
                              checked={formData.features.includes(feature)}
                              onCheckedChange={() => toggleFeature(feature)}
                              className="flex-shrink-0"
                            />
                            <Label htmlFor={feature} className="text-xs sm:text-sm cursor-pointer flex-1 leading-tight">{feature}</Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Media Upload Section */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        Property Media
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-600">Upload images and videos to showcase your property</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 transition-colors hover:border-gray-400">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mb-2 sm:mb-3" />
                          <div className="space-y-1">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900">Upload Property Media</h3>
                            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Drag and drop or click to upload images and videos</p>
                            <p className="text-xs text-gray-600 sm:hidden">Tap to upload images and videos</p>
                            <label htmlFor="media-upload" className="cursor-pointer mt-2 sm:mt-3 inline-block">
                              <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                                Choose Files
                              </span>
                              <input
                                id="media-upload"
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        {mediaFiles.length > 0 && (
                          <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                            {mediaFiles.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                  {file.type.startsWith('image/') ? (
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <Video className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeMediaFile(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  aria-label={`Remove ${file.name}`}
                                  title={`Remove ${file.name}`}
                                >
                                  <XCircle className="h-3 w-3" />
                                </button>
                                <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 h-9 sm:h-10 text-xs sm:text-sm">
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        // Redirect to full-page payment
                        const paymentUrl = new URL('/payment/full-page', window.location.origin);
                        paymentUrl.searchParams.set('amount', '1000'); // Setup fee for crowd funding campaign
                        paymentUrl.searchParams.set('email', user?.email || '');
                        paymentUrl.searchParams.set('description', `Crowd Funding Campaign Setup: ${formData.title}`);
                        paymentUrl.searchParams.set('type', 'crowd-funding');
                        paymentUrl.searchParams.set('returnUrl', window.location.pathname);
                        paymentUrl.searchParams.set('metadata', JSON.stringify({
                          campaign_title: formData.title,
                          setup_fee: '1000',
                          user_id: user?.id
                        }));
                        window.location.href = paymentUrl.toString();
                      }}
                      className="flex-1 h-9 sm:h-10 bg-gray-900 hover:bg-gray-800 text-xs sm:text-sm"
                    >
                      {loading ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Sidebar */}
              <div className="space-y-3 sm:space-y-4">
                {/* Contact Selection */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      Invite Contributors
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600">Select contacts to invite for co-investment</CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                    <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                      {contacts.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No contacts available</p>
                          <p className="text-xs text-gray-400 mt-1">Add contacts to invite them</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                              <Checkbox
                                id={`contact-${contact.id}`}
                                checked={selectedContacts.includes(contact.id)}
                                onCheckedChange={() => toggleContactSelection(contact.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {contact.first_name} {contact.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedContacts.length > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Campaign Preview */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">Campaign Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Target Amount</Label>
                      <p className="text-xl font-bold text-gray-900">
                        {formData.target_amount ? formatCurrency(parseFloat(formData.target_amount)) : '₦0'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Invited Contributors</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedContacts.length}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Media Files</Label>
                      <p className="text-lg font-semibold text-gray-900">{mediaFiles.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contacts Modal */}
        <Dialog open={showContactsModal} onOpenChange={setShowContactsModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-7xl w-[96vw] sm:w-[90vw] md:w-auto p-3 sm:p-4 md:p-6">
            <DialogHeader className="space-y-2 sm:space-y-3 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold truncate">Campaign Contributors</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    Track contributions and engagement for {selectedPropertyForContacts?.title}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedPropertyForContacts && (
              <div className="space-y-4 sm:space-y-6">
                {/* Campaign Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="border-gray-200">
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            {calculatePercentage(selectedPropertyForContacts.current_amount, selectedPropertyForContacts.target_amount)}%
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">Funding Progress</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            {formatCurrency(selectedPropertyForContacts.current_amount)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">Amount Raised</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            {selectedPropertyForContacts.invitations?.length || 0}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">Total Invited</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            {formatCurrency(selectedPropertyForContacts.target_amount)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">Target Amount</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contributors List */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                    <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      Contributor Details
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600">
                      Detailed breakdown of all invited contacts and their contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                    {selectedPropertyForContacts.invitations && selectedPropertyForContacts.invitations.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {selectedPropertyForContacts.invitations.map((invitation) => {
                          // Find contribution for this invitee
                          const contribution = selectedPropertyForContacts.contributions?.find(
                            c => c.invitation_id === invitation.id
                          );

                          const contactName = invitation.contact
                            ? `${invitation.contact.first_name} ${invitation.contact.last_name}`
                            : invitation.invitee_email || invitation.invitee_phone || 'Unknown Contact';

                          const contributionPercentage = contribution?.contribution_percentage || 0;
                          const contributionAmount = contribution?.amount || 0;

                          return (
                            <div key={invitation.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">
                                      {invitation.contact?.first_name?.[0] || invitation.invitee_email?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{contactName}</h3>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Invited {new Date(invitation.invited_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}</span>
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] sm:text-xs capitalize border-gray-300 ${
                                          invitation.status === 'accepted'
                                            ? 'bg-green-50 text-green-700 border-green-300'
                                            : 'bg-orange-50 text-orange-700 border-orange-300'
                                        }`}
                                      >
                                        {invitation.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-left sm:text-right space-y-1">
                                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                                    {contributionPercentage.toFixed(2)}%
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">of target</div>
                                  <div className="text-sm sm:text-base font-semibold text-gray-900">
                                    {formatCurrency(contributionAmount)}
                                  </div>
                                  {contribution && (
                                    <div className="text-[10px] sm:text-xs text-gray-500">
                                      {new Date(contribution.contributed_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mt-3 sm:mt-4">
                                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                                  <span>Contribution Progress</span>
                                  <span className="hidden sm:inline">{contributionPercentage.toFixed(2)}% of campaign target</span>
                                  <span className="sm:hidden">{contributionPercentage.toFixed(2)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(contributionPercentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">No Contributors Yet</h3>
                        <p className="text-xs sm:text-sm text-gray-600">No contacts have been invited to this campaign yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Property Details Dialog */}
        {selectedProperty && (
          <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-7xl w-[96vw] sm:w-[90vw] md:w-auto p-3 sm:p-4 md:p-6">
              <DialogHeader className="space-y-2 sm:space-y-3 pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold line-clamp-2">{selectedProperty.title}</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-gray-600 truncate">{selectedProperty.location}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                {/* Campaign Status Banner */}
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                          {getStatusIcon(selectedProperty.status)}
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Campaign Status</h3>
                          <Badge variant="outline" className="text-xs sm:text-sm border-gray-300 text-gray-700 mt-1">
                            {selectedProperty.status.charAt(0).toUpperCase() + selectedProperty.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                          {calculatePercentage(selectedProperty.current_amount, selectedProperty.target_amount)}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Funding Complete</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="border-gray-200">
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                            {formatCurrency(selectedProperty.current_amount)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">Amount Raised</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                            {formatCurrency(selectedProperty.target_amount)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 truncate">Target Amount</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Visualization */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      Funding Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Campaign Progress</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {calculatePercentage(selectedProperty.current_amount, selectedProperty.target_amount)}% Complete
                        </span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={calculatePercentage(selectedProperty.current_amount, selectedProperty.target_amount)}
                          className="h-3 bg-gray-200"
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                          <span>{formatCurrency(selectedProperty.current_amount)} raised</span>
                          <span>{formatCurrency(selectedProperty.target_amount)} target</span>
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
                        <Label className="text-sm font-medium text-gray-700">Property Value</Label>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedProperty.price)}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="text-gray-700 leading-relaxed text-sm">{selectedProperty.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">Category</Label>
                          <p className="text-gray-900 font-medium text-sm">{selectedProperty.category?.name}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">Created</Label>
                          <p className="text-gray-900 font-medium text-sm">
                            {new Date(selectedProperty.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {selectedProperty.features && selectedProperty.features.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Property Features</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProperty.features.map((feature) => (
                              <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Funding Configuration */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        Funding Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Target Amount</Label>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedProperty.target_amount)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Min Contribution</Label>
                            <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedProperty.min_contribution || 1000)}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Max Contribution</Label>
                            <p className="text-base font-semibold text-gray-900">
                              {selectedProperty.max_contribution ? formatCurrency(selectedProperty.max_contribution) : 'No limit'}
                            </p>
                          </div>
                        </div>

                        {selectedProperty.deadline && (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Campaign Deadline</Label>
                            <p className="text-base font-semibold text-gray-900">
                              {new Date(selectedProperty.deadline).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Media Gallery */}
                {selectedProperty.media && selectedProperty.media.length > 0 && (
                  <Card className="border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gray-500" />
                        Property Media Gallery
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {selectedProperty.media.length} media file{selectedProperty.media.length !== 1 ? 's' : ''} uploaded
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedProperty.media.map((media) => (
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
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
    </div>
  );
}

export default function CrowdFundingPage() {
  return (
    <ProtectedRoute>
      <CrowdFundingPageContent />
    </ProtectedRoute>
  );
}
