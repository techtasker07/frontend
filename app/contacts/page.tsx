'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, UserPlus, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface Referral {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

interface PendingInvite {
  id: string;
  phone_number: string;
  invited_at: string;
  status: string;
}

function ContactsPageContent() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
        setPendingInvites(data.pendingInvites || []);
      } else {
        toast.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setFetching(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Invite sent successfully!');
        setPhoneNumber('');

        // Open WhatsApp with the invite message
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
        }

        // Refresh the contacts list
        fetchContacts();
      } else {
        toast.error(data.error || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Contacts & Referrals</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Invite your contacts to join Mipripity and track your referrals
          </p>
        </div>

        {/* Invite Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite a Contact
            </CardTitle>
            <CardDescription>
              Send a WhatsApp invite to your contact to join Mipripity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="tel"
                  placeholder="Enter phone number (e.g., +1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading} className="flex items-center gap-2 w-full sm:w-auto">
                <MessageCircle className="h-4 w-4" />
                {loading ? 'Sending...' : 'Send Invite'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{referrals.length}</p>
                  <p className="text-sm text-muted-foreground">Registered Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Phone className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingInvites.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Invites</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <UserPlus className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{referrals.length + pendingInvites.length}</p>
                  <p className="text-sm text-muted-foreground">Total Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registered Referrals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Registered Contacts</CardTitle>
            <CardDescription>
              Contacts who have joined Mipripity through your invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No registered contacts yet. Start inviting your friends!
              </p>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {referral.first_name?.[0] || referral.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {referral.first_name} {referral.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{referral.email}</p>
                        {referral.phone_number && (
                          <p className="text-sm text-muted-foreground">{referral.phone_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge variant="secondary" className="mb-1">Registered</Badge>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDate(referral.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invites */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
            <CardDescription>
              Contacts you've invited but haven't registered yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingInvites.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending invites. Send your first invite above!
              </p>
            ) : (
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invite.phone_number}</p>
                        <p className="text-sm text-muted-foreground">Invited {formatDate(invite.invited_at)}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <ProtectedRoute>
      <ContactsPageContent />
    </ProtectedRoute>
  );
}