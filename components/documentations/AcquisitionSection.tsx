'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileText, Upload, CheckCircle, AlertCircle, Info, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { BillingCalculator } from '@/lib/billing-calculations';

interface AcquisitionFormData {
  // Applicant Information
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;

  // Property Information
  propertyAddress: string;
  coordinates: string;
  landArea: string; // in square meters
  clientType: 'individual' | 'corporate';

  // Seller Information
  sellerName: string;
  sellerContact: string;

  // Documents
  documents: File[];

  // Additional Information
  description: string;
}

const initialFormData: AcquisitionFormData = {
  applicantName: '',
  applicantEmail: '',
  applicantPhone: '',
  propertyAddress: '',
  coordinates: '',
  landArea: '',
  clientType: 'individual',
  sellerName: '',
  sellerContact: '',
  description: '',
  documents: []
};

export function AcquisitionSection() {
  const [formData, setFormData] = useState<AcquisitionFormData>(initialFormData);
  const [billingBreakdown, setBillingBreakdown] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof AcquisitionFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Check if property information is filled
  const isPropertyInfoFilled = formData.propertyAddress && formData.coordinates && formData.landArea && formData.clientType;

  // Calculate billing when form data changes
  useEffect(() => {
    if (formData.landArea && formData.clientType && isPropertyInfoFilled) {
      try {
        const landArea = parseFloat(formData.landArea);
        if (!isNaN(landArea) && landArea > 0) {
          const breakdown = BillingCalculator.calculateDueDiligenceFee(landArea, formData.clientType);
          setBillingBreakdown(breakdown);
        } else {
          setBillingBreakdown(null);
        }
      } catch (error) {
        console.error('Error calculating fees:', error);
        setBillingBreakdown(null);
      }
    } else {
      setBillingBreakdown(null);
    }
  }, [formData.landArea, formData.clientType, isPropertyInfoFilled]);

  const handleSubmit = async () => {
    if (!formData.applicantName || !formData.propertyAddress || !formData.coordinates || !formData.landArea || !formData.clientType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmissionStatus('success');
      toast.success('Acquisition due diligence submitted successfully');

      // Reset form
      setFormData(initialFormData);
    } catch (error) {
      setSubmissionStatus('error');
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Main Content */}
      <div className="flex-1 order-2 lg:order-2">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Due Diligence Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {submissionStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Submission Successful</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your acquisition due diligence has been submitted for processing.
                </p>
              </div>
            )}

            {submissionStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Submission Failed</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  There was an error submitting your application. Please try again.
                </p>
              </div>
            )}

            <Separator />

            {/* Service Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Service Type</h3>
              <div className="space-y-2">
                <Label>Select the type of acquisition service you need *</Label>
                <Select
                  value={formData.clientType}
                  onValueChange={(value: any) => handleInputChange('clientType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Due Diligence</SelectItem>
                    <SelectItem value="corporate">Corporate Due Diligence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Property Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">Property Address *</Label>
                  <Input
                    id="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                    placeholder="Enter full property address"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinates">Property Coordinates *</Label>
                  <Input
                    id="coordinates"
                    value={formData.coordinates}
                    onChange={(e) => handleInputChange('coordinates', e.target.value)}
                    placeholder="Enter property coordinates"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landArea">Land Area (sqm) *</Label>
                  <Input
                    id="landArea"
                    type="number"
                    value={formData.landArea}
                    onChange={(e) => handleInputChange('landArea', e.target.value)}
                    placeholder="e.g., 500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Applicant Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Applicant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Full Name *</Label>
                  <Input
                    id="applicantName"
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicantEmail">Email Address</Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    value={formData.applicantEmail}
                    onChange={(e) => handleInputChange('applicantEmail', e.target.value)}
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicantPhone">Phone Number</Label>
                  <Input
                    id="applicantPhone"
                    value={formData.applicantPhone}
                    onChange={(e) => handleInputChange('applicantPhone', e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Seller Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seller Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellerName">Seller Name</Label>
                  <Input
                    id="sellerName"
                    value={formData.sellerName}
                    onChange={(e) => handleInputChange('sellerName', e.target.value)}
                    placeholder="Seller's full name"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellerContact">Seller Contact</Label>
                  <Input
                    id="sellerContact"
                    value={formData.sellerContact}
                    onChange={(e) => handleInputChange('sellerContact', e.target.value)}
                    placeholder="Seller's phone or email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="description">Description/Notes</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Any additional notes..."
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Fee Calculation */}
      <div className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Fee Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPropertyInfoFilled ? (
              billingBreakdown ? (
                <div className="space-y-3">
                  <div className="text-sm space-y-2">
                    {billingBreakdown.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{item.description}:</span>
                        <span className="font-medium">{BillingCalculator.formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{BillingCalculator.formatCurrency(billingBreakdown.subtotal)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Fill in land area and client type to see fee calculation
                </p>
              )
            ) : (
              <p className="text-sm text-gray-500">
                Complete the Property Information section to view fee calculation
              </p>
            )}

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Service Information</h4>
              <div className="text-xs space-y-1 text-gray-600">
                <div>• Document verification</div>
                <div>• Coordinate charting</div>
                <div>• Due diligence report</div>
                <div>• Processing: 2-3 weeks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}