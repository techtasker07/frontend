'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { PaystackPayment } from '@/components/paystack/paystack-payment';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Upload, Users, Coins, Calendar, MapPin, Camera, Video, Plus, CheckCircle, Clock, XCircle, MessageCircle, Send, ArrowLeft, CreditCard } from 'lucide-react';
import useSWR, { mutate } from 'swr';

interface ReesPartyProperty {
  id: string;
  title: string
  description: string;
  location: string;
  venue_details?: string;
  event_date: string;
  event_time?: string;
  dress_code?: string;
  requirements: string[];
  status: string;
  target_amount: number;
  current_amount: number;
  contribution_per_person: number;
  max_participants?: number;
  current_participants: number;
  deadline: string;
  created_at: string;
  media: ReesPartyMedia[];
  category: { name: string };
  invitations?: Invitation[];
  contributions?: Contribution[];
  forum_messages?: ForumMessage[];
}

interface ReesPartyMedia {
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
  payment_reference?: string;
  contributed_at: string;
  contributor?: Contact;
}

interface ForumMessage {
  id: string;
  sender_id: string;
  message: string;
  message_type: string;
  media_url?: string;
  created_at: string;
  sender?: Contact;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  message_type: string;
  media_url?: string;
  created_at: string;
  sender?: Contact;
}

function ReesPartyPageContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'manage' | 'contribute'>('manage');
    const [loading, setLoading] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<ReesPartyProperty | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState<'form' | 'summary' | 'payment_redirect' | 'success'>('form');
    const [paymentReference, setPaymentReference] = useState<string>('');
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [selectedPropertyForContacts, setSelectedPropertyForContacts] = useState<ReesPartyProperty | null>(null);
    const [selectedPropertyForChat, setSelectedPropertyForChat] = useState<ReesPartyProperty | null>(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newChatMessage, setNewChatMessage] = useState('');

    // Form states
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      location: '',
      venue_details: '',
      event_date: '',
      event_time: '',
      dress_code: '',
      target_amount: '',
      contribution_per_person: '5000',
      creator_contribution: '',
      max_participants: '',
      deadline: '',
      category_id: '',
      requirements: [] as string[]
    });

    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [contributionAmount, setContributionAmount] = useState('');

   // Check for payment reference in URL on component mount
   useEffect(() => {
     const paymentRef = searchParams.get('payment_reference');
     if (paymentRef) {
       // If we have a payment reference, redirect to success page
       router.replace(`/rees-party/success?reference=${paymentRef}`);
     }
   }, [searchParams, router]);

   // Use SWR for properties
   const { data: properties = [], isLoading: propertiesLoading } = useSWR(
     user ? ['rees-party-properties', user.id] : null,
     async ([, userId]) => {
       const response = await fetch(`/api/rees-party?userId=${userId}`);
       const result = await response.json();
       if (result.success) {
         return result.data;
       } else {
         throw new Error('Failed to fetch parties');
       }
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
     'rees-party-contacts',
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
     user ? ['rees-party-contributions', user.id] : null,
     async ([, userId]) => {
       const { data: contributions, error: contributionsError } = await supabase
         .from('rees_party_contributions')
         .select(`
           *,
           party:rees_party_properties(
             id,
             title,
             description,
             location,
             target_amount,
             current_amount,
             status,
             event_date,
             created_at
           ),
           invitation:rees_party_invitations(
             id,
             status,
             invited_at
           )
         `)
         .eq('contributor_id', userId)
         .order('contributed_at', { ascending: false });

       if (contributionsError) throw contributionsError;

       const { data: invitations, error: invitationsError } = await supabase
         .from('rees_party_invitations')
         .select(`
           id,
           status,
           invited_at,
           property:rees_party_properties(
             id,
             title,
             description,
             location,
             target_amount,
             current_amount,
             status,
             contribution_per_person,
             max_participants,
             deadline,
             event_date,
             created_at
           )
         `)
         .eq('invitee_id', userId)
         .eq('status', 'accepted')
         .order('invited_at', { ascending: false });

       if (invitationsError) throw invitationsError;

       const contributedPropertyIds = new Set(contributions?.map(c => c.party_id) || []);
       const pendingInvitations = invitations?.filter((inv: any) => inv.property && (inv.property as any).id && !contributedPropertyIds.has((inv.property as any).id)) || [];

       return {
         contributions: contributions || [],
         invitedProperties: pendingInvitations.map((inv: any) => inv.property).filter(Boolean) as ReesPartyProperty[]
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


  const fetchChatMessages = async (partyId: string) => {
    try {
      const response = await fetch(`/api/rees-party/${partyId}/forum`);
      const result = await response.json();

      if (result.success) {
        setChatMessages(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch chat messages');
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to fetch chat messages');
    }
  };

  const handleSendChatMessage = async () => {
    if (!newChatMessage.trim() || !user || !selectedPropertyForChat) return;

    try {
      const response = await fetch(`/api/rees-party/${selectedPropertyForChat.id}/forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: user.id,
          message: newChatMessage.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setChatMessages(prev => [...prev, result.data]);
        setNewChatMessage('');
        toast.success('Message sent!');
      } else {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast.error('Failed to send message');
    }
  };

  const openChatModal = (party: ReesPartyProperty) => {
    setSelectedPropertyForChat(party);
    setShowChatModal(true);
    fetchChatMessages(party.id);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.title || !formData.description || !formData.location || !formData.event_date || !formData.target_amount || !formData.contribution_per_person || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate creator contribution
    const targetAmount = parseFloat(formData.target_amount);
    const minContribution = parseFloat(formData.contribution_per_person);
    const creatorContribution = parseFloat(formData.creator_contribution || '0');

    if (creatorContribution < minContribution) {
      toast.error(`Your contribution must be at least ₦${minContribution.toLocaleString()} (minimum per person)`);
      return;
    }

    if (creatorContribution > targetAmount) {
      toast.error(`Your contribution cannot exceed the target amount of ₦${targetAmount.toLocaleString()}`);
      return;
    }

    // Move to summary step
    setCreateStep('summary');
  };

  // Payment success is now handled by the full-page payment component
  // This function is kept for backward compatibility but should not be called
  const handlePaymentSuccess = async (reference: string) => {
    console.warn('handlePaymentSuccess called - this should not happen with full-page payment');
    setPaymentReference(reference);
    setCreateStep('success');
  };

  const handlePublishParty = async () => {
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
      // Create the party
      const response = await fetch('/api/rees-party', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: user.id,
          payment_reference: paymentRef,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const partyId = result.data.id;

        try {
          // Upload media files
          if (mediaFiles.length > 0) {
            await uploadMediaFiles(partyId);
          }

          // Send invitations
          if (selectedContacts.length > 0) {
            await sendInvitations(partyId);
          }

          // Creator makes their initial contribution after payment
          const creatorContributionAmount = parseFloat(formData.creator_contribution || '0');
          const creatorResponse = await fetch(`/api/rees-party/${partyId}/contributions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contributor_id: user.id,
              invitation_id: null, // Creator doesn't have an invitation
              amount: creatorContributionAmount,
              payment_status: 'completed',
              payment_reference: paymentRef,
            }),
          });

          const creatorResult = await creatorResponse.json();
          if (!creatorResult.success) {
            console.warn('Creator contribution failed, but party was created:', creatorResult.error);
          }

          toast.success('Re-es Party created successfully! Your contribution has been recorded.');
          setFormData({
            title: '',
            description: '',
            location: '',
            venue_details: '',
            event_date: '',
            event_time: '',
            dress_code: '',
            target_amount: '',
            contribution_per_person: '5000',
            creator_contribution: '',
            max_participants: '',
            deadline: '',
            category_id: '',
            requirements: []
          });
          setMediaFiles([]);
          setSelectedContacts([]);
          await mutate(['rees-party-properties', user.id]);
          setActiveTab('manage');
          setShowCreateModal(false);
          setCreateStep('form');
          setPaymentReference('');
          } catch (mediaError) {
          console.error('Error with media upload or invitations:', mediaError);
          toast.error('Party created but there was an issue with media upload. Please try again.');
          // Still close the modal and reset form since party was created
          setFormData({
            title: '',
            description: '',
            location: '',
            venue_details: '',
            event_date: '',
            event_time: '',
            dress_code: '',
            target_amount: '',
            contribution_per_person: '5000',
            creator_contribution: '',
            max_participants: '',
            deadline: '',
            category_id: '',
            requirements: []
          });
          setMediaFiles([]);
          setSelectedContacts([]);
          await mutate(['rees-party-properties', user.id]);
          setActiveTab('manage');
          setShowCreateModal(false);
          setCreateStep('form');
          setPaymentReference('');
        }
      } else {
        toast.error(result.error || 'Failed to create party');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create party');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    // Stay on payment step or allow going back
    toast.info('Payment cancelled. You can try again or go back to edit the form.');
  };

  const handleBackToForm = () => {
    setCreateStep('form');
  };

  const uploadMediaFiles = async (partyId: string) => {
    try {
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${partyId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('rees-party-media')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('rees-party-media')
          .getPublicUrl(fileName);

        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

        const { error: insertError } = await supabase
          .from('rees_party_media')
          .insert({
            party_id: partyId,
            media_url: publicUrl,
            media_type: mediaType,
            file_name: file.name,
            file_size: file.size,
            is_primary: mediaFiles.indexOf(file) === 0
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Failed to save media record for ${file.name}: ${insertError.message}`);
        }
      }
    } catch (error) {
      console.error('Error in uploadMediaFiles:', error);
      throw error; // Re-throw to be caught by the calling function
    }
  };

  const sendInvitations = async (partyId: string) => {
    const invitations = selectedContacts.map(contactId => {
      const contact = contacts.find(c => c.id === contactId);
      return {
        party_id: partyId,
        inviter_id: user?.id,
        invitee_id: contactId,
        invitee_email: contact?.email,
        invitee_phone: contact?.phone_number,
        status: 'pending'
      };
    });

    const { error } = await supabase
      .from('rees_party_invitations')
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

  const toggleRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(requirement)
        ? prev.requirements.filter(r => r !== requirement)
        : [...prev.requirements, requirement]
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
      case 'completed': return 'bg-blue-100 text-blue-800 border-l-blue-500';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-l-yellow-500';
      case 'cancelled': return 'bg-red-100 text-red-800 border-l-red-500';
      default: return 'bg-gray-100 text-gray-800 border-l-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'planning': return <Calendar className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">Re-es Party</h1>
              <p className="text-xs text-gray-600">Plan and organize parties</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-sm px-3">
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline text-xs">Create</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden md:block mb-6 lg:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Re-es Party</h1>
                <p className="text-sm lg:text-base text-gray-600">
                  Plan and organize memorable parties with your contacts
                </p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800">
                <Plus className="h-4 w-4" />
                Create Party
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4 md:mb-6 px-2 sm:px-4 md:px-0">
              <TabsTrigger value="manage" className="text-xs sm:text-sm md:text-base py-2 sm:py-3 md:py-2">Manage Parties</TabsTrigger>
              <TabsTrigger value="contribute" className="text-xs sm:text-sm md:text-base py-2 sm:py-3 md:py-2">My Contributions</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="space-y-3 sm:space-y-4 md:space-y-6 px-2 sm:px-4 md:px-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {(properties as ReesPartyProperty[]).map((property: ReesPartyProperty) => (
                  <Card
                    key={property.id}
                    className={`hover:shadow-lg transition-shadow border-l-4 ${getStatusColor(property.status).split(' ')[2]} overflow-hidden relative`}
                  >
                    {/* Image with diagonal cut - positioned at top right corner */}
                    <div
                      className="absolute top-0 right-0 w-40 h-40 md:w-56 md:h-24 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${(() => {
                          const firstImage: ReesPartyMedia | null =
                            property.media?.find((m: ReesPartyMedia) => m.media_type === 'image') || null;
                          return firstImage?.media_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
                        })()})`,
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%)'
                      }}
                    >
                      <div className="absolute top-3 right-3">
                        <Badge className={`${getStatusColor(property.status)} text-xs md:text-sm`}>
                          {getStatusIcon(property.status)}
                          <span className="ml-1 capitalize hidden sm:inline">{property.status}</span>
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3 px-4 md:px-6 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-48 md:pr-64">
                          <CardTitle className="text-base md:text-sm line-clamp-2 leading-tight">{property.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span className="text-xs md:text-sm truncate">{property.location}</span>
                          </CardDescription>
                        </div>
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

                        {/* Event Date */}
                        <div className="text-xs md:text-sm text-gray-600">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                          {new Date(property.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {property.event_time && ` at ${property.event_time}`}
                        </div>

                        {/* Participants */}
                        <div className="text-xs md:text-sm text-gray-600">
                          <Users className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                          {property.current_participants} participant{property.current_participants !== 1 ? 's' : ''}
                          {property.max_participants && ` / ${property.max_participants} max`}
                        </div>

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
                <Card className="mx-2 sm:mx-4 md:mx-0">
                  <CardContent className="text-center py-6 sm:py-8 md:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Plus className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">No Parties Yet</h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">
                      Start planning your first party to bring people together
                    </p>
                    <Button onClick={() => setShowCreateModal(true)} className="bg-gray-900 hover:bg-gray-800 text-sm sm:text-base">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Party
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="contribute" className="space-y-4 md:space-y-6 px-2 sm:px-4 md:px-0">
              {/* My Contributions Section */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
                  <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    My Contributions
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm text-gray-600">
                    Parties you've contributed to
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
                                  {contribution.party?.title?.[0] || 'P'}
                                </span>
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-1">{contribution.party?.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{contribution.party?.location}</span>
                                  </span>
                                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                    {contribution.party?.status}
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
                                Contributed: {new Date(contribution.contributed_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                Due: {new Date(contribution.party?.deadline).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openChatModal(contribution.party)}
                                  className="text-xs h-7"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Chat
                                </Button>
                                {contribution.payment_status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`/receipt/${contribution.payment_reference}`, '_blank')}
                                    className="text-xs h-7"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Receipt
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2">
                              <span>Party Progress</span>
                              <span>{calculatePercentage(contribution.party?.current_amount || 0, contribution.party?.target_amount || 1)}% funded</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(calculatePercentage(contribution.party?.current_amount || 0, contribution.party?.target_amount || 1), 100)}%` }}
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
                      Parties you're invited to contribute to
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
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span>{new Date(property.event_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-left sm:text-right space-y-2">
                              <div className="text-xs md:text-sm text-gray-600">
                                Contribution: {formatCurrency(property.contribution_per_person || 5000)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Due: {new Date(property.deadline).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedProperty(property)}
                                  className="bg-gray-900 hover:bg-gray-800 text-xs w-full sm:w-auto h-9 md:h-10"
                                >
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openChatModal(property)}
                                  className="text-xs h-9 md:h-10 px-3"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Chat
                                </Button>
                              </div>
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

          {/* Create Party Modal */}
          <Dialog open={showCreateModal} onOpenChange={(open) => {
            setShowCreateModal(open);
            if (!open) {
              setCreateStep('form');
              setPaymentReference('');
            }
          }}>
            <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto p-2 sm:p-4 md:p-6 !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50 sm:max-w-[85vw]">
              <DialogHeader className="space-y-2 sm:space-y-3 pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {createStep === 'form' ? <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" /> :
                     createStep === 'summary' ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" /> :
                     createStep === 'payment_redirect' ? <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" /> :
                     <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold truncate">
                      {createStep === 'form' ? 'Create New Party' :
                       createStep === 'summary' ? 'Review Party Details' :
                       createStep === 'payment_redirect' ? 'Redirecting to Payment...' :
                       'Payment Successful'}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                      {createStep === 'form' ? 'Plan an amazing party and invite your contacts' :
                       createStep === 'summary' ? 'Review your party details before proceeding to payment' :
                       createStep === 'payment_redirect' ? 'Redirecting you to secure payment page' :
                       'Your payment was successful. Click Publish Party to create your event.'}
                    </DialogDescription>
                  </div>
                  {(createStep === 'payment_redirect' || createStep === 'success') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackToForm}
                      className="flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pt-2">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                  {createStep === 'form' || createStep === 'payment_redirect' ? (
                    <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
                    {/* Party Information Section */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                        <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          Party Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="title" className="text-xs sm:text-sm font-medium text-gray-700">Party Title *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g., John's Birthday Bash"
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
                            placeholder="Describe the party theme, activities, and what makes it special..."
                            rows={3}
                            className="resize-none text-sm"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="event_date" className="text-xs sm:text-sm font-medium text-gray-700">Event Date *</Label>
                            <Input
                              id="event_date"
                              type="date"
                              value={formData.event_date}
                              onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                              className="h-9 sm:h-10 text-sm"
                              required
                            />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="event_time" className="text-xs sm:text-sm font-medium text-gray-700">Event Time</Label>
                            <Input
                              id="event_time"
                              type="time"
                              value={formData.event_time}
                              onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                              className="h-9 sm:h-10 text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="venue_details" className="text-xs sm:text-sm font-medium text-gray-700">Venue Details</Label>
                          <Textarea
                            id="venue_details"
                            value={formData.venue_details}
                            onChange={(e) => setFormData(prev => ({ ...prev, venue_details: e.target.value }))}
                            placeholder="Specific venue address, parking info, etc."
                            rows={2}
                            className="resize-none text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="dress_code" className="text-xs sm:text-sm font-medium text-gray-700">Dress Code</Label>
                            <Input
                              id="dress_code"
                              value={formData.dress_code}
                              onChange={(e) => setFormData(prev => ({ ...prev, dress_code: e.target.value }))}
                              placeholder="e.g., Smart Casual, Black Tie"
                              className="h-9 sm:h-10 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="category" className="text-xs sm:text-sm font-medium text-gray-700">Category</Label>
                            <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                              <SelectTrigger className="h-9 sm:h-10 text-sm">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="birthday">Birthday</SelectItem>
                                <SelectItem value="wedding">Wedding</SelectItem>
                                <SelectItem value="graduation">Graduation</SelectItem>
                                <SelectItem value="corporate">Corporate</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contribution Configuration Section */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                        <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                          <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          Contribution Configuration
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
                            placeholder="500000"
                            className="h-9 sm:h-10 text-sm"
                            required
                          />
                          <p className="text-xs text-gray-500">The total amount you want to raise for this party</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="contribution_per_person" className="text-xs sm:text-sm font-medium text-gray-700">Contribution per Person (₦) *</Label>
                            <Input
                              id="contribution_per_person"
                              type="number"
                              value={formData.contribution_per_person}
                              onChange={(e) => setFormData(prev => ({ ...prev, contribution_per_person: e.target.value }))}
                              placeholder="5000"
                              className="h-9 sm:h-10 text-sm"
                              required
                            />
                            <p className="text-xs text-gray-500">Minimum amount others must contribute</p>
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="creator_contribution" className="text-xs sm:text-sm font-medium text-gray-700">Your Contribution (₦) *</Label>
                            <Input
                              id="creator_contribution"
                              type="number"
                              value={formData.creator_contribution}
                              onChange={(e) => setFormData(prev => ({ ...prev, creator_contribution: e.target.value }))}
                              placeholder="Enter your contribution amount"
                              className="h-9 sm:h-10 text-sm"
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Min: ₦{formData.contribution_per_person ? parseFloat(formData.contribution_per_person).toLocaleString() : '0'} |
                              Max: ₦{formData.target_amount ? parseFloat(formData.target_amount).toLocaleString() : '0'}
                            </p>
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="max_participants" className="text-xs sm:text-sm font-medium text-gray-700">Max Participants</Label>
                            <Input
                              id="max_participants"
                              type="number"
                              value={formData.max_participants}
                              onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                              placeholder="Optional"
                              className="h-9 sm:h-10 text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                          <Label htmlFor="deadline" className="text-xs sm:text-sm font-medium text-gray-700">Payment Deadline *</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                            className="h-9 sm:h-10 text-sm"
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Requirements Section */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                        <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          Additional Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                          {['Bring a dish', 'BYOB', 'Plus one allowed', 'Family friendly', 'Music preference', 'Dietary restrictions', 'Transportation needed', 'Accommodation needed'].map((requirement) => (
                            <div key={requirement} className="flex items-center space-x-2 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <Checkbox
                                id={requirement}
                                checked={formData.requirements.includes(requirement)}
                                onCheckedChange={() => toggleRequirement(requirement)}
                                className="flex-shrink-0"
                              />
                              <Label htmlFor={requirement} className="text-[10px] sm:text-xs cursor-pointer flex-1 leading-tight">{requirement}</Label>
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
                          Party Media
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-gray-600">Upload images and videos to showcase your party</CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 transition-colors hover:border-gray-400">
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mb-2 sm:mb-3" />
                            <div className="space-y-1">
                              <h3 className="text-sm sm:text-base font-medium text-gray-900">Upload Party Media</h3>
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
                      <Button type="submit" disabled={loading} className="flex-1 h-9 sm:h-10 bg-gray-900 hover:bg-gray-800 text-xs sm:text-sm">
                        {loading ? 'Processing...' : 'Proceed to Summary'}
                      </Button>
                    </div>
                  </form>
                  ) : createStep === 'summary' ? (
                    <div className="space-y-6">
                      {/* Summary Step */}
                      <Card className="border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-gray-500" />
                            Party Summary
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            Review your party details before proceeding to payment
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Party Summary */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-gray-900">{formData.title}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Target Amount:</span>
                                <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(formData.target_amount || '0'))}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Your Contribution:</span>
                                <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(formData.creator_contribution || '0'))}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                Remaining for others: {formatCurrency(Math.max(0, parseFloat(formData.target_amount || '0') - parseFloat(formData.creator_contribution || '0')))}
                              </p>
                            </div>
                          </div>

                          {/* Pay Now Button */}
                          <div className="flex justify-center">
                            <Button
                              onClick={() => {
                                // Store form data in localStorage before payment
                                const formDataToStore = {
                                  ...formData,
                                  mediaFiles: mediaFiles.map(file => ({
                                    name: file.name,
                                    size: file.size,
                                    type: file.type,
                                    lastModified: file.lastModified
                                  })),
                                  selectedContacts
                                };
                                localStorage.setItem('rees_party_form_data', JSON.stringify(formDataToStore));

                                setCreateStep('payment_redirect');
                                // Auto-redirect after a brief delay to show the redirect step
                                setTimeout(() => {
                                  const paymentUrl = new URL('/payment/full-page', window.location.origin);
                                  paymentUrl.searchParams.set('amount', formData.creator_contribution || '0');
                                  paymentUrl.searchParams.set('email', user?.email || '');
                                  paymentUrl.searchParams.set('description', `Re-es Party: ${formData.title}`);
                                  paymentUrl.searchParams.set('type', 'rees-party');
                                  paymentUrl.searchParams.set('returnUrl', window.location.pathname);
                                  paymentUrl.searchParams.set('metadata', JSON.stringify({
                                    party_title: formData.title,
                                    contribution_amount: formData.creator_contribution,
                                    user_id: user?.id
                                  }));
                                  window.location.href = paymentUrl.toString();
                                }, 1000);
                              }}
                              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg font-semibold"
                            >
                              <CreditCard className="h-5 w-5 mr-2" />
                              Pay Now
                            </Button>
                          </div>

                          <p className="text-xs text-gray-500 text-center">
                            Click "Pay Now" to proceed with your initial contribution
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : createStep === 'success' ? (
                    <div className="space-y-6">
                      {/* Payment Redirect Step */}
                      <Card className="border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            Redirecting to Payment
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            You will be redirected to a secure payment page
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Party Summary */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-gray-900">{formData.title}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Target Amount:</span>
                                <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(formData.target_amount || '0'))}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Your Contribution:</span>
                                <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(formData.creator_contribution || '0'))}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                Remaining for others: {formatCurrency(Math.max(0, parseFloat(formData.target_amount || '0') - parseFloat(formData.creator_contribution || '0')))}
                              </p>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                            <p className="text-sm text-gray-600">Redirecting to secure payment page...</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Success Step */}
                      <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Payment Successful!
                          </CardTitle>
                          <CardDescription className="text-sm text-green-700">
                            Your payment has been processed successfully. Ready to launch your party?
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Party Summary */}
                          <div className="bg-white rounded-lg p-4 border border-green-200 space-y-3">
                            <h3 className="font-medium text-gray-900">{formData.title}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Target Amount:</span>
                                <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(formData.target_amount || '0'))}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Your Contribution:</span>
                                <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(formData.creator_contribution || '0'))}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200 space-y-1">
                              <p className="text-xs text-gray-600">
                                Payment Reference: <span className="font-mono text-gray-800">{paymentReference}</span>
                              </p>
                              <p className="text-xs text-gray-600">
                                Remaining for others: {formatCurrency(Math.max(0, parseFloat(formData.target_amount || '0') - parseFloat(formData.creator_contribution || '0')))}
                              </p>
                            </div>
                          </div>

                          {/* Publish Party Button */}
                          <div className="flex justify-center">
                            <Button
                              onClick={handlePublishParty}
                              disabled={loading}
                              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg font-semibold"
                            >
                              {loading ? 'Publishing Party...' : 'Publish Party'}
                            </Button>
                          </div>

                          <p className="text-xs text-gray-500 text-center">
                            Click "Publish Party" to create your event and send invitations
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Contact Selection */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                      <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        Invite Participants
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-600">Select contacts to invite to your party</CardDescription>
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

                  {/* Party Preview */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-semibold">Party Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Target Amount</Label>
                        <p className="text-xl font-bold text-gray-900">
                          {formData.target_amount ? formatCurrency(parseFloat(formData.target_amount)) : '₦0'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Contribution per Person</Label>
                        <p className="text-lg font-semibold text-gray-900">
                          {formData.contribution_per_person ? formatCurrency(parseFloat(formData.contribution_per_person)) : formatCurrency(5000)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Your Contribution</Label>
                        <p className="text-lg font-semibold text-gray-900">
                          {formData.creator_contribution ? formatCurrency(parseFloat(formData.creator_contribution)) : 'Not set'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Invited Participants</Label>
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
            <DialogContent
              className="max-h-[90vh] overflow-y-auto p-2 sm:p-4 md:p-6"
              style={{ maxWidth: '95vw', width: '95vw' }}
            >
              <DialogHeader className="space-y-2 sm:space-y-3 pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold truncate">Party Participants</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      Track contributions and engagement for {selectedPropertyForContacts?.title}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {selectedPropertyForContacts && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Party Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-gray-200">
                      <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
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

                  {/* Participants List */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        Participant Details
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-600">
                        Detailed breakdown of all invited contacts and their contributions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                      {selectedPropertyForContacts.invitations && selectedPropertyForContacts.invitations.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                          {selectedPropertyForContacts.invitations.map((invitation) => {
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
                                      <>
                                        <div className="text-[10px] sm:text-xs text-gray-500">
                                          {new Date(contribution.contributed_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </div>
                                        {contribution.payment_status === 'completed' && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(`/receipt/${contribution.payment_reference}`, '_blank')}
                                            className="mt-2 text-xs h-6"
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Receipt
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 sm:mt-4">
                                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                                    <span>Contribution Progress</span>
                                    <span className="hidden sm:inline">{contributionPercentage.toFixed(2)}% of party target</span>
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
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">No Participants Yet</h3>
                          <p className="text-xs sm:text-sm text-gray-600">No contacts have been invited to this party yet.</p>
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
                <DialogContent
                  className="max-h-[90vh] overflow-y-auto p-2 sm:p-4 md:p-6"
                  style={{ maxWidth: '95vw', width: '95vw' }}
                >
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
                  {/* Party Status Banner */}
                  <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                            {getStatusIcon(selectedProperty.status)}
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Party Status</h3>
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
                            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
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
                            <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                              {selectedProperty.current_participants}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-600 truncate">Participants</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                              {new Date(selectedProperty.event_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-600 truncate">Event Date</p>
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
                          <span className="text-sm font-medium text-gray-700">Party Progress</span>
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

                  {/* Party Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Party Information */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          Party Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Description</Label>
                          <p className="text-gray-700 leading-relaxed text-sm">{selectedProperty.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Event Date</Label>
                            <p className="text-gray-900 font-medium text-sm">
                              {new Date(selectedProperty.event_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Event Time</Label>
                            <p className="text-gray-900 font-medium text-sm">
                              {selectedProperty.event_time || 'TBD'}
                            </p>
                          </div>
                        </div>

                        {selectedProperty.venue_details && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Venue Details</Label>
                            <p className="text-gray-700 text-sm">{selectedProperty.venue_details}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Dress Code</Label>
                            <p className="text-gray-900 font-medium text-sm">
                              {selectedProperty.dress_code || 'Casual'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Category</Label>
                            <p className="text-gray-900 font-medium text-sm">{selectedProperty.category?.name}</p>
                          </div>
                        </div>

                        {selectedProperty.requirements && selectedProperty.requirements.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Additional Requirements</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedProperty.requirements.map((requirement) => (
                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                  {requirement}
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
                          <Coins className="h-4 w-4 text-gray-500" />
                          Contribution Details
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
                              <Label className="text-sm font-medium text-gray-700">Contribution per Person</Label>
                              <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedProperty.contribution_per_person || 5000)}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-700">Payment Deadline</Label>
                              <p className="text-base font-semibold text-gray-900">
                                {new Date(selectedProperty.deadline).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-700">Current Participants</Label>
                              <p className="text-base font-semibold text-gray-900">{selectedProperty.current_participants}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-700">Max Participants</Label>
                              <p className="text-base font-semibold text-gray-900">
                                {selectedProperty.max_participants || 'No limit'}
                              </p>
                            </div>
                          </div>
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
                          Party Media Gallery
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
                                    alt="Party media"
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

          {/* Chat Modal */}
          <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
            <DialogContent className="max-w-[95vw] w-[95vw] max-h-[85vh] overflow-hidden p-2 sm:p-4 md:p-6 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 sm:max-w-4xl">
              <DialogHeader className="space-y-2 sm:space-y-3 pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold truncate">
                      Party Chat - {selectedPropertyForChat?.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                      Chat with other contributors to this party
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex flex-col h-[60vh] max-h-[500px]">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 rounded-lg">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-gray-600">Start the conversation with other contributors!</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => {
                      const senderName = message.sender_id === user?.id
                        ? `${user?.first_name || 'You'} ${user?.last_name || ''}`.trim()
                        : `${message.sender?.first_name || 'Unknown'} ${message.sender?.last_name || 'User'}`.trim();

                      return (
                        <div key={message.id} className={`flex gap-3 ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                          {message.sender_id !== user?.id && (
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-gray-700">
                                {message.sender?.first_name?.[0] || senderName[0] || 'U'}
                              </span>
                            </div>
                          )}
                          <div className={`max-w-[70%] ${message.sender_id === user?.id ? 'order-first' : ''}`}>
                            <div className={`rounded-lg p-3 ${message.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}>
                              <div className={`text-xs font-medium mb-1 ${message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-900'}`}>
                                {senderName}
                              </div>
                              <p className="text-sm leading-relaxed">{message.message}</p>
                            </div>
                            <div className={`text-xs text-gray-500 mt-1 ${message.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                              {new Date(message.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          </div>
                          {message.sender_id === user?.id && (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-white">
                                {user?.first_name?.[0] || senderName[0] || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    <Input
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendChatMessage}
                      disabled={!newChatMessage.trim()}
                      className="flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default function ReesPartyPage() {
  return (
    <ProtectedRoute>
      <ReesPartyPageContent />
    </ProtectedRoute>
  );
}