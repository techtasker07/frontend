'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ReesPartyProperty {
  id: string;
  title: string;
  location: string;
  forum_expiry: string;
  status: string;
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

function ReesPartyForumPageContent() {
  const params = useParams();
  const router = useRouter();
  const partyId = params.id as string;
  const { user } = useAuth();
  const [party, setParty] = useState<ReesPartyProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    fetchPartyDetails();
    fetchForumMessages();
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

  const fetchForumMessages = async () => {
    try {
      const response = await fetch(`/api/rees-party/${partyId}/forum`);
      const result = await response.json();

      if (result.success) {
        setForumMessages(result.data);
      }
    } catch (error) {
      console.error('Error fetching forum messages:', error);
    }
  };

  const checkParticipationStatus = async () => {
    if (!user) return;

    try {
      const { data: invitation } = await supabase
        .from('rees_party_invitations')
        .select('id, status')
        .eq('party_id', partyId)
        .eq('invitee_id', user.id)
        .eq('status', 'accepted')
        .single();

      setIsParticipant(!!invitation);
    } catch (error) {
      console.error('Error checking participation status:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch(`/api/rees-party/${partyId}/forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: user.id,
          message: newMessage.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setForumMessages(prev => [...prev, result.data]);
        setNewMessage('');
        toast.success('Message sent!');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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
          <p className="mt-4 text-gray-600">Loading forum...</p>
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{party.title} Forum</h1>
                <p className="text-sm text-gray-600">{party.location}</p>
              </div>
            </div>
            <Badge variant={isForumActive() ? "default" : "secondary"} className="text-sm">
              {isForumActive() ? 'Active' : 'Expired'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Forum Status */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Party Forum</h3>
              <p className="text-sm text-gray-600">
                {isForumActive()
                  ? `Active until ${new Date(party.forum_expiry).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}`
                  : 'Forum has expired'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col pb-20">
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
          <div className="max-w-4xl mx-auto flex-1 flex flex-col">
            <Card className="flex-1 border-gray-200 flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-lg font-semibold">Discussion</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {forumMessages.length} message{forumMessages.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col pb-0">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                  {forumMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-gray-600">Be the first to start the conversation!</p>
                    </div>
                  ) : (
                    forumMessages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-700">
                            {message.sender?.first_name?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {message.sender?.first_name} {message.sender?.last_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{message.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Message Input - Fixed at bottom for mobile responsiveness */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
              {isParticipant && isForumActive() ? (
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-3 items-end">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Share your thoughts about the party..."
                      className="flex-1 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      style={{
                        maxHeight: '120px',
                        minHeight: '40px'
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="flex-shrink-0 h-10 w-10 p-0 mb-1"
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto text-center">
                  <p className="text-sm text-gray-600">
                    {!isParticipant
                      ? "You need to be invited to participate in the forum"
                      : "The forum has expired and is no longer active"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReesPartyForumPage() {
  return (
    <ProtectedRoute>
      <ReesPartyForumPageContent />
    </ProtectedRoute>
  );
}