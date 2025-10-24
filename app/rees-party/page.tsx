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
import { Upload, Users, Coins, Calendar, MapPin, Camera, Video, Plus, CheckCircle, Clock, XCircle, MessageCircle, Send, ArrowLeft, CreditCard, Search, Filter, ArrowRight, Grid3X3, List, SortAsc } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';

interface ReesPartyProperty {
  id: string;
  title: string;
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

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "amount_high" | "amount_low" | "title_asc" | "title_desc";

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
      // Store the payment reference and open the modal at success step
      setPaymentReference(paymentRef);
      setCreateStep('success');
      setShowCreateModal(true);

      // Retrieve the stored form data
      const storedData = localStorage.getItem('rees_party_form_data');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setFormData({
            title: parsedData.title,
            description: parsedData.description,
            location: parsedData.location,
            venue_details: parsedData.venue_details,
            event_date: parsedData.event_date,
            event_time: parsedData.event_time,
            dress_code: parsedData.dress_code,
            target_amount: parsedData.target_amount,
            contribution_per_person: parsedData.contribution_per_person,
            creator_contribution: parsedData.creator_contribution,
            max_participants: parsedData.max_participants,
            deadline: parsedData.deadline,
            category_id: parsedData.category_id,
            requirements: parsedData.requirements
          });
          setSelectedContacts(parsedData.selectedContacts || []);
          // Note: We can't restore File objects from localStorage
          // Media files will need to be re-uploaded if needed
        } catch (error) {
          console.error('Error parsing stored form data:', error);
        }
      }

      // Clean up the URL
      router.replace('/rees-party', { scroll: false });
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

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "newest":
        return "Newest First";
      case "oldest":
        return "Oldest First";
      case "amount_high":
        return "Target Amount: High to Low";
      case "amount_low":
        return "Target Amount: Low to High";
      case "title_asc":
        return "Title: A to Z";
      case "title_desc":
        return "Title: Z to A";
      default:
        return "Newest First";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentage = (amount: number, target: number) => {
    return Math.round((amount / target) * 100);
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
            <Button onClick={() => router.push('/rees-party/create')} size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-sm px-3">
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
              <Button onClick={() => router.push('/rees-party/create')} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800">
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
                        <div className="flex gap-4 pt-4 justify-center">
                          <Link href={`/rees-party/${property.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs md:text-sm h-9 md:h-10"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/rees-party/${property.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3 md:px-3 h-9 md:h-10 relative"
                            >
                              <Users className="h-3 w-3 md:h-4 md:w-4" />
                              {property.invitations && property.invitations.length > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-500 hover:bg-blue-600"
                                >
                                  {property.invitations.length}
                                </Badge>
                              )}
                            </Button>
                          </Link>
                          <Link href={`/rees-party/${property.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3 md:px-3 h-9 md:h-10 relative"
                            >
                              <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
                              {property.forum_messages && property.forum_messages.length > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500 hover:bg-green-600"
                                >
                                  {property.forum_messages.length}
                                </Badge>
                              )}
                            </Button>
                          </Link>
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
                    <Button onClick={() => router.push('/rees-party/create')} className="bg-gray-900 hover:bg-gray-800 text-sm sm:text-base">
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
                                <Link href={`/rees-party/${contribution.party?.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7"
                                  >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Chat
                                  </Button>
                                </Link>
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
                                <Link href={`/rees-party/${property.id}`}>
                                  <Button
                                    size="sm"
                                    className="bg-gray-900 hover:bg-gray-800 text-xs w-full sm:w-auto h-9 md:h-10"
                                  >
                                    View Details
                                  </Button>
                                </Link>
                                <Link href={`/rees-party/${property.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-9 md:h-10 px-3"
                                  >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Chat
                                  </Button>
                                </Link>
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