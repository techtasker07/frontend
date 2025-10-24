'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Users, Coins, Calendar, MapPin, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';

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

function ReesPartyContactsPageContent() {
  const params = useParams();
  const router = useRouter();
  const partyId = params.id as string;
  const { user } = useAuth();
  const [party, setParty] = useState<ReesPartyProperty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartyDetails();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading party contacts...</p>
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
          <Button onClick={() => router.push('/rees-party')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parties
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
                onClick={() => router.push(`/rees-party/${partyId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{party.title}</h1>
                <p className="text-sm text-gray-600">Party Participants</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(party.status)} text-sm`}>
              {getStatusIcon(party.status)}
              <span className="ml-1 capitalize">{party.status}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
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
                      {calculatePercentage(party.current_amount, party.target_amount)}%
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
                      {formatCurrency(party.current_amount)}
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
                      {party.invitations?.length || 0}
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
                      {formatCurrency(party.target_amount)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate">Target Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participants List */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3 sm:pb-4 px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                Participant Details
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600">
                Detailed breakdown of all invited contacts and their contributions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              {party.invitations && party.invitations.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {party.invitations.map((invitation) => {
                    const contribution = party.contributions?.find(
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
      </div>
    </div>
  );
}

export default function ReesPartyContactsPage() {
  return (
    <ProtectedRoute>
      <ReesPartyContactsPageContent />
    </ProtectedRoute>
  );
}