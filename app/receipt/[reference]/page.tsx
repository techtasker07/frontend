'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { CheckCircle, Download, ArrowLeft, Calendar, Coins, MapPin } from 'lucide-react';
import Link from 'next/link';

interface ReceiptData {
  id: string;
  amount: number;
  payment_reference: string;
  payment_status: string;
  contributed_at: string;
  contributor: {
    first_name: string;
    last_name: string;
    email: string;
  };
  party: {
    id: string;
    title: string;
    description: string;
    location: string;
    event_date: string;
    target_amount: number;
    current_amount: number;
  };
}

function ReceiptPageContent() {
  const params = useParams();
  const reference = params.reference as string;
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, [reference]);

  const fetchReceipt = async () => {
    try {
      const { data, error } = await supabase
        .from('rees_party_contributions')
        .select(`
          id,
          amount,
          payment_reference,
          payment_status,
          contributed_at,
          contributor:profiles!rees_party_contributions_contributor_id_fkey(
            first_name,
            last_name,
            email
          ),
          party:rees_party_properties(
            id,
            title,
            description,
            location,
            event_date,
            target_amount,
            current_amount
          )
        `)
        .eq('payment_reference', reference)
        .eq('contributor_id', user?.id)
        .single();

      if (error) throw error;
      setReceipt(data as any);
    } catch (error) {
      console.error('Error fetching receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadReceipt = () => {
    // Simple implementation - in a real app, you'd generate a PDF
    const receiptContent = `
      PAYMENT RECEIPT
      ===============

      Reference: ${receipt?.payment_reference}
      Date: ${new Date(receipt?.contributed_at || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}

      Party: ${receipt?.party.title}
      Location: ${receipt?.party.location}
      Event Date: ${new Date(receipt?.party.event_date || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}

      Contributor: ${receipt?.contributor.first_name} ${receipt?.contributor.last_name}
      Email: ${receipt?.contributor.email}

      Amount Paid: ${formatCurrency(receipt?.amount || 0)}

      Status: ${receipt?.payment_status}

      Thank you for your contribution!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Receipt Not Found</h2>
          <p className="text-gray-600 mb-4">The receipt you're looking for doesn't exist or you don't have permission to view it.</p>
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
      <div className="bg-white border-b border-gray-200">
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
                <h1 className="text-xl font-bold text-gray-900">Payment Receipt</h1>
                <p className="text-sm text-gray-600">Reference: {reference}</p>
              </div>
            </div>
            <Button onClick={handleDownloadReceipt} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Banner */}
          <Card className="border-green-200 bg-green-50 mb-6">
            <CardContent className="pt-6 px-6 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Payment Successful</h3>
                  <p className="text-sm text-green-700">Your contribution has been processed successfully</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Details */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Coins className="h-5 w-5 text-gray-500" />
                Receipt Details
              </CardTitle>
              <CardDescription>
                Transaction completed on {new Date(receipt.contributed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount */}
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(receipt.amount)}
                </div>
                <Badge variant="outline" className="text-sm border-green-300 text-green-700">
                  {receipt.payment_status.charAt(0).toUpperCase() + receipt.payment_status.slice(1)}
                </Badge>
              </div>

              {/* Party Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Party Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{receipt.party.title}</p>
                      <p className="text-sm text-gray-600">{receipt.party.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Event Date: {new Date(receipt.party.event_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contributor Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Contributor Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-gray-900">
                    {receipt.contributor.first_name} {receipt.contributor.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{receipt.contributor.email}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Transaction Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reference</span>
                    <span className="text-sm font-medium text-gray-900">{receipt.payment_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date & Time</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(receipt.contributed_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(receipt.amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Thank you for your contribution! This receipt serves as proof of payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <ProtectedRoute>
      <ReceiptPageContent />
    </ProtectedRoute>
  );
}