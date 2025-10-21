'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Upload, Users, Coins, Calendar, MapPin, Camera, Video, Plus, CheckCircle, Clock, XCircle, MessageCircle, Send, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { PaystackPayment } from '@/components/paystack/paystack-payment';

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
  forum_expiry: string;
  created_at: string;
  user_id: string;
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

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

function ReesPartyDetailsPageContent() {
  const params = useParams();
  const partyId = params.id as string;
  const { user } = useAuth();
  const [party, setParty] = useState<ReesPartyProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'forum'>('details');
  const [contributionAmount, setContributionAmount] = useState('');
  const [showContributionDialog, setShowContributionDialog] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    fetchPartyDetails();
    checkParticipationStatus();
  }, [partyId]);

  const fetchPartyDetails = async () => {
    try {
      const response = await fetch(`/api/rees-party/${partyId}`);
      const result = await response.json();

      if (result.success) {
        setParty(result.data);
      } else {
        toast.error('Failed to fetch party details');
      }
    } catch (error) {
      console.error('Error fetching party details:', error);
      toast.error('Failed to fetch party details');
    } finally {
      setLoading(false);
    }
  };


  const checkParticipationStatus = async () => {
    if (!user) return;

    try {
      // Check if user is the party creator
      const isCreator = party?.user_id === user.id;

      // Check if user is invited (only if not creator)
      let invitation = null;
      if (!isCreator) {
        const { data: invData } = await supabase
          .from('rees_party_invitations')
          .select('id, status')
          .eq('party_id', partyId)
          .eq('invitee_id', user.id)
          .eq('status', 'accepted')
          .single();
        invitation = invData;
      }

      // User can contribute if they are the creator OR an accepted invitee
      setIsParticipant(isCreator || !!invitation);

      // Check if user has contributed
      const { data: contribution } = await supabase
        .from('rees_party_contributions')
        .select('id')
        .eq('party_id', partyId)
        .eq('contributor_id', user.id)
        .eq('payment_status', 'completed')
        .single();

      setHasContributed(!!contribution);
    } catch (error) {
      console.error('Error checking participation status:', error);
    }
  };


  const handlePaymentSuccess = async (reference: string) => {
    if (!user || !contributionAmount) return;

    setPaymentProcessing(true);
    try {
      // Verify payment with Paystack
      const verifyResponse = await fetch(`/api/paystack/verify?reference=${reference}`);
      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        toast.error('Payment verification failed');
        return;
      }

      const amount = parseFloat(contributionAmount);
      const isCreator = party?.user_id === user.id;

      let invitationId = null;

      // If user is not the creator, find their invitation
      if (!isCreator) {
        const { data: invitation } = await supabase
          .from('rees_party_invitations')
          .select('id')
          .eq('party_id', partyId)
          .eq('invitee_id', user.id)
          .eq('status', 'accepted')
          .single();

        if (!invitation) {
          toast.error('You are not invited to this party');
          return;
        }
        invitationId = invitation.id;
      }

      // Create contribution record
      const response = await fetch(`/api/rees-party/${partyId}/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contributor_id: user.id,
          invitation_id: invitationId, // null for creator
          amount: amount,
          payment_status: 'completed',
          payment_reference: reference,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Payment successful! Receipt will be sent to your email.');
        setShowContributionDialog(false);
        setContributionAmount('');
        fetchPartyDetails();
        setHasContributed(true);
      } else {
        toast.error(result.error || 'Failed to record contribution');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    setPaymentProcessing(false);
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

  const isForumActive = () => {
    if (!party) return false;
    return new Date(party.forum_expiry) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading party details...</p>
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Party Not Found</h2>
          <p className="text-gray-600 mb-4">The party you're looking for doesn't exist or has been removed.</p>
          <Link href="/rees-party">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Parties
            </Button>
          </Link>
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
              <Link href="/rees-party">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{party.title}</h1>
                <p className="text-sm text-gray-600">{party.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(party.status)} text-sm`}>
                {getStatusIcon(party.status)}
                <span className="ml-1 capitalize">{party.status}</span>
              </Badge>
              {isParticipant && !hasContributed && party.status !== 'completed' && (
                <Button onClick={() => setShowContributionDialog(true)} size="sm">
                  <Coins className="h-4 w-4 mr-2" />
                  Contribute
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="details" className="text-sm">Party Details</TabsTrigger>
              <TabsTrigger value="forum" className="text-sm flex items-center gap-2" asChild>
                <Link href={`/rees-party/${partyId}/forum`} className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Forum
                  {isForumActive() && (
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  )}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Party Status Banner */}
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="pt-6 px-6 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(party.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Party Status</h3>
                        <Badge variant="outline" className="text-sm border-gray-300 text-gray-700 mt-1">
                          {party.status.charAt(0).toUpperCase() + party.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {calculatePercentage(party.current_amount, party.target_amount)}%
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
                          {formatCurrency(party.current_amount)}
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
                          {formatCurrency(party.target_amount)}
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
                          {party.current_participants}
                        </p>
                        <p className="text-xs text-gray-600 truncate">Participants</p>
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
                          {new Date(party.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-600 truncate">Event Date</p>
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
                        {calculatePercentage(party.current_amount, party.target_amount)}% Complete
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={calculatePercentage(party.current_amount, party.target_amount)}
                        className="h-4 bg-gray-200"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>{formatCurrency(party.current_amount)} raised</span>
                        <span>{formatCurrency(party.target_amount)} target</span>
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
                      <p className="text-gray-700 leading-relaxed text-sm">{party.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Event Date</Label>
                        <p className="text-gray-900 font-medium text-sm">
                          {new Date(party.event_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Event Time</Label>
                        <p className="text-gray-900 font-medium text-sm">
                          {party.event_time || 'TBD'}
                        </p>
                      </div>
                    </div>

                    {party.venue_details && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Venue Details</Label>
                        <p className="text-gray-700 text-sm">{party.venue_details}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Dress Code</Label>
                        <p className="text-gray-900 font-medium text-sm">
                          {party.dress_code || 'Casual'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Category</Label>
                        <p className="text-gray-900 font-medium text-sm">{party.category?.name}</p>
                      </div>
                    </div>

                    {party.requirements && party.requirements.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Additional Requirements</Label>
                        <div className="flex flex-wrap gap-2">
                          {party.requirements.map((requirement) => (
                            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                              {requirement}
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
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(party.target_amount)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">Contribution per Person</Label>
                          <p className="text-base font-semibold text-gray-900">{formatCurrency(party.contribution_per_person || 5000)}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">Payment Deadline</Label>
                          <p className="text-base font-semibold text-gray-900">
                            {new Date(party.deadline).toLocaleDateString('en-US', {
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
                          <p className="text-base font-semibold text-gray-900">{party.current_participants}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">Max Participants</Label>
                          <p className="text-base font-semibold text-gray-900">
                            {party.max_participants || 'No limit'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Media Gallery */}
              {party.media && party.media.length > 0 && (
                <Card className="border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Camera className="h-4 w-4 text-gray-500" />
                      Party Media Gallery
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {party.media.length} media file{party.media.length !== 1 ? 's' : ''} uploaded
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {party.media.map((media) => (
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
            </TabsContent>

          </Tabs>

          {/* Contribution Dialog */}
          <Dialog open={showContributionDialog} onOpenChange={setShowContributionDialog}>
            <DialogContent className="max-w-lg fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
              <DialogHeader>
                <DialogTitle>Make Contribution</DialogTitle>
                <DialogDescription>
                  Contribute to {party.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contribution-amount">Contribution Amount (₦)</Label>
                  <Input
                    id="contribution-amount"
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder={party.contribution_per_person?.toString() || '5000'}
                    min="1"
                  />
                  <p className="text-xs text-gray-600">
                    Suggested amount: {formatCurrency(party.contribution_per_person || 5000)}
                  </p>
                </div>
                {contributionAmount && parseFloat(contributionAmount) > 0 && user?.email && (
                  <PaystackPayment
                    amount={parseFloat(contributionAmount) * 100} // Convert to kobo
                    email={user.email}
                    onSuccess={handlePaymentSuccess}
                    onClose={handlePaymentClose}
                    metadata={{
                      party_id: partyId,
                      party_title: party.title,
                      contributor_id: user.id,
                      contribution_type: 'rees_party'
                    }}
                    className="w-full"
                  />
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowContributionDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default function ReesPartyDetailsPage() {
  return (
    <ProtectedRoute>
      <ReesPartyDetailsPageContent />
    </ProtectedRoute>
  );
}