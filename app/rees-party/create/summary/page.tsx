'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaystackPayment } from '@/components/paystack/paystack-payment';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';

function ReesPartyCreateSummaryPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // Retrieve stored form data
    const storedData = localStorage.getItem('rees_party_form_data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing stored form data:', error);
        toast.error('Form data not found. Please start over.');
        router.push('/rees-party/create');
      }
    } else {
      toast.error('Form data not found. Please start over.');
      router.push('/rees-party/create');
    }
  }, [router]);

  const handlePaymentSuccess = async (reference: string) => {
    if (!user || !formData) return;

    setLoading(true);
    toast.success('Payment successful! Creating your party...');

    try {
      // Create the party
      const response = await fetch('/api/rees-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          venue_details: formData.venue_details,
          event_date: formData.event_date,
          event_time: formData.event_time,
          dress_code: formData.dress_code,
          requirements: formData.requirements,
          target_amount: formData.target_amount,
          contribution_per_person: formData.contribution_per_person,
          max_participants: formData.max_participants,
          deadline: formData.deadline,
          category_id: formData.category_id,
          user_id: user.id,
          payment_reference: reference
        }),
      });

      const result = await response.json();
      if (result.success) {
        const partyId = result.data.id;

        // Upload media and send invitations
        if (formData.mediaFiles?.length > 0) await uploadMediaFiles(partyId);
        if (formData.selectedContacts?.length > 0) await sendInvitations(partyId);

        // Record creator's contribution
        await fetch(`/api/rees-party/${partyId}/contributions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contributor_id: user.id,
            invitation_id: null,
            amount: parseFloat(formData.creator_contribution || '0'),
            payment_status: 'completed',
            payment_reference: reference,
          }),
        });

        toast.success('Re-es Party created successfully!');
        localStorage.removeItem('rees_party_form_data');
        router.push(`/rees-party/${partyId}`);
      } else {
        toast.error(result.error || 'Failed to create party');
        router.push('/rees-party/create');
      }
    } catch (error) {
      console.error('Error creating party:', error);
      toast.error('Failed to create party');
      router.push('/rees-party/create');
    } finally {
      setLoading(false);
    }
  };

  const uploadMediaFiles = async (partyId: string) => {
    if (!formData.mediaFiles || formData.mediaFiles.length === 0) return;

    try {
      for (const file of formData.mediaFiles) {
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
            is_primary: formData.mediaFiles.indexOf(file) === 0
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Failed to save media record for ${file.name}: ${insertError.message}`);
        }
      }
    } catch (error) {
      console.error('Error in uploadMediaFiles:', error);
      throw error;
    }
  };

  const sendInvitations = async (partyId: string) => {
    if (!formData.selectedContacts || formData.selectedContacts.length === 0) return;

    const invitations = formData.selectedContacts.map((contactId: string) => ({
      party_id: partyId,
      inviter_id: user?.id,
      invitee_id: contactId,
      invitee_email: null, // Will be populated by backend
      invitee_phone: null, // Will be populated by backend
      status: 'pending'
    }));

    const { error } = await supabase
      .from('rees_party_invitations')
      .insert(invitations);

    if (error) throw error;
  };

  const handlePaymentClose = () => {
    toast.info('Payment cancelled. You can modify the form and try again.');
    router.push('/rees-party/create');
  };

  const handleBackToForm = () => {
    router.push('/rees-party/create');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToForm}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Form
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Review Party Details</h1>
                <p className="text-sm text-gray-600">Review your party details before proceeding to payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Party Summary */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-500" />
                Party Summary
              </CardTitle>
              <CardDescription>Review your party details before proceeding to payment</CardDescription>
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

              {/* Payment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Secure Payment Required</h4>
                    <p className="text-sm text-blue-700">Complete payment to create your party and send invitations</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <PaystackPayment
                    amount={Math.round(parseFloat(formData.creator_contribution || '0') * 100)}
                    email={user?.email || ''}
                    onSuccess={handlePaymentSuccess}
                    onClose={handlePaymentClose}
                    metadata={{
                      party_title: formData.title,
                      contribution_amount: formData.creator_contribution,
                      user_id: user?.id,
                      type: 'rees-party-creation'
                    }}
                    className="w-full max-w-md bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Complete payment to create your party. Your party will be published automatically after successful payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ReesPartyCreateSummaryPage() {
  return (
    <ProtectedRoute>
      <ReesPartyCreateSummaryPageContent />
    </ProtectedRoute>
  );
}