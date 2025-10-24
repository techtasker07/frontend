'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { MessageCircle, Send, ArrowLeft, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

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

function ReesPartyChatPageContent() {
  const params = useParams();
  const router = useRouter();
  const partyId = params.id as string;
  const { user } = useAuth();
  const [party, setParty] = useState<ReesPartyProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ForumMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  useEffect(() => {
    fetchPartyDetails();
    fetchChatMessages();
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

  const fetchChatMessages = async () => {
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
    if (!newChatMessage.trim() || !user) return;

    try {
      const response = await fetch(`/api/rees-party/${partyId}/forum`, {
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
          <p className="mt-4 text-gray-600">Loading party chat...</p>
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
                <p className="text-sm text-gray-600">Party Chat</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(party.status)} text-sm`}>
                {getStatusIcon(party.status)}
                <span className="ml-1 capitalize">{party.status}</span>
              </Badge>
              {!isForumActive() && (
                <Badge variant="secondary" className="text-xs">
                  Forum Closed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-gray-200 h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="pb-3 sm:pb-4 px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg md:text-xl font-semibold truncate">
                    Party Chat - {party.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                    Chat with other contributors to this party
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 rounded-lg mb-4">
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
              {isForumActive() ? (
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
              ) : (
                <div className="border-t border-gray-200 pt-4 text-center">
                  <p className="text-sm text-gray-600">Forum is closed. You can no longer send messages.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ReesPartyChatPage() {
  return (
    <ProtectedRoute>
      <ReesPartyChatPageContent />
    </ProtectedRoute>
  );
}