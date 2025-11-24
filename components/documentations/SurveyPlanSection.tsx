'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertCircle, Info, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { BillingCalculator } from '@/lib/billing-calculations';

interface SurveyPlanFormData {
  // Service Selection
  serviceType: 'fresh-survey' | 'existing-coordinates' | 'direct-verification' | 'retaking-points';

  // Applicant Information
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;

  // Property Information
  propertyAddress: string;
  state: string;
  lga: string;
  plotSize: string;
  titleType: 'private' | 'commercial' | 'industrial';

  // Desired Name (for fresh survey and existing coordinates)
  desiredName?: string;

  // Coordinates/Survey Points (for existing coordinates)
  surveyPoints?: string;

  // Survey Information (for verification)
  existingSurveyNumber?: string;
  surveyDate?: string;

  // Documents
  documents: File[];

  // Additional Information
  description: string;
}

const initialFormData: SurveyPlanFormData = {
  serviceType: 'fresh-survey',
  applicantName: '',
  applicantEmail: '',
  applicantPhone: '',
  propertyAddress: '',
  state: '',
  lga: '',
  plotSize: '',
  titleType: 'private',
  description: '',
  documents: []
};

const LAGOS_LGAS = [
  // Zone A
  'Apapa LGA', 'Eti-Osa LGA', 'Ikeja LGA', 'Lagos Island',
  // Zone B
  'Kosofe LGA', 'Lagos Mainland LGA', 'Mushin LGA', 'Surulere LGA', 'Somolu LGA',
  // Zone C
  'Agege LGA', 'Alimosho LGA', 'Amuwo-Odofin LGA', 'Ibeju-Lekki LGA', 'Ifako-Ijaiye', 'Oshodi/Isolo LGA', 'Ojo LGA',
  // Zone D
  'Ajeromi-Ifelodun LGA', 'Badagry LGA', 'Epe LGA', 'Ikorodu LGA'
];

export function SurveyPlanSection() {
  const [formData, setFormData] = useState<SurveyPlanFormData>(initialFormData);
  const [billingBreakdown, setBillingBreakdown] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof SurveyPlanFormData, value: string | File[]) => {
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

  // Calculate billing when form data changes
  useEffect(() => {
    if (formData.plotSize && formData.lga) {
      try {
        const zone = BillingCalculator.getZoneByLGA(formData.lga);
        if (zone) {
          const plotSize = parseFloat(formData.plotSize);
          if (!isNaN(plotSize)) {
            const breakdown = BillingCalculator.calculateSurveyFee({
              zone: zone as 'A' | 'B' | 'C' | 'D',
              plotSize,
              surveyType: 'survey-plan',
              serviceSubtype: formData.serviceType,
              titleType: formData.titleType
            });
            setBillingBreakdown(breakdown);
          }
        }
      } catch (error) {
        console.error('Error calculating fees:', error);
        setBillingBreakdown(null);
      }
    } else {
      setBillingBreakdown(null);
    }
  }, [formData.plotSize, formData.lga, formData.serviceType, formData.titleType]);

  const handleSubmit = async () => {
    if (formData.documents.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    if (!formData.applicantName || !formData.propertyAddress || !formData.lga || !formData.plotSize) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      // Here you would implement the actual file upload and form submission
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmissionStatus('success');
      toast.success('Survey Plan submitted successfully for processing');

      // Reset form
      setFormData(initialFormData);
      setBillingBreakdown(null);
    } catch (error) {
      setSubmissionStatus('error');
      toast.error('Failed to submit Survey Plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Main Content */}
      <div className="flex-1 order-1 lg:order-2">
        <Card>
          <CardHeader>
            <CardTitle>Survey Plan Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {submissionStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Submission Successful</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your Survey Plan application has been submitted for processing. You will receive updates via email.
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

            {/* Service Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Service Type</h3>
              <div className="space-y-2">
                <Label>Select the type of survey service you need *</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value: any) => handleInputChange('serviceType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresh-survey">Process Fresh Survey (New survey with coordinates)</SelectItem>
                    <SelectItem value="existing-coordinates">Process Survey with Existing Coordinates</SelectItem>
                    <SelectItem value="direct-verification">Verify Survey (Direct Verification)</SelectItem>
                    <SelectItem value="retaking-points">Verify Survey (Retaking Survey Points)</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => handleInputChange('state', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lagos">Lagos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lga">Local Government Area *</Label>
                  <Select
                    value={formData.lga}
                    onValueChange={(value) => handleInputChange('lga', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select LGA" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAGOS_LGAS.map((lga) => (
                        <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plotSize">Plot Size (sqm) *</Label>
                  <Input
                    id="plotSize"
                    type="number"
                    value={formData.plotSize}
                    onChange={(e) => handleInputChange('plotSize', e.target.value)}
                    placeholder="e.g., 500"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleType">Title Type *</Label>
                  <Select
                    value={formData.titleType}
                    onValueChange={(value: any) => handleInputChange('titleType', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select title type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Conditional Fields Based on Service Type */}
            {(formData.serviceType === 'fresh-survey' || formData.serviceType === 'existing-coordinates') && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Desired Name on Survey</h3>
                  <div className="space-y-2">
                    <Label htmlFor="desiredName">Desired Survey Name</Label>
                    <Input
                      id="desiredName"
                      value={formData.desiredName || ''}
                      onChange={(e) => handleInputChange('desiredName', e.target.value)}
                      placeholder="Name to appear on survey plan"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.serviceType === 'existing-coordinates' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Survey Points/Coordinates</h3>
                  <div className="space-y-2">
                    <Label htmlFor="surveyPoints">Survey Points *</Label>
                    <Textarea
                      id="surveyPoints"
                      value={formData.surveyPoints || ''}
                      onChange={(e) => handleInputChange('surveyPoints', e.target.value)}
                      placeholder="Enter your survey coordinates/points"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </>
            )}

            {(formData.serviceType === 'direct-verification' || formData.serviceType === 'retaking-points') && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Existing Survey Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="existingSurveyNumber">Existing Survey Number</Label>
                      <Input
                        id="existingSurveyNumber"
                        value={formData.existingSurveyNumber || ''}
                        onChange={(e) => handleInputChange('existingSurveyNumber', e.target.value)}
                        placeholder="Survey plan number"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surveyDate">Original Survey Date</Label>
                      <Input
                        id="surveyDate"
                        type="date"
                        value={formData.surveyDate || ''}
                        onChange={(e) => handleInputChange('surveyDate', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Document Upload</h3>
              <div className="space-y-2">
                <Label htmlFor="documents">Upload Documents *</Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, JPG, JPEG, PNG, DOC, DOCX. Maximum file size: 10MB each.
                </p>
                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded Documents:</p>
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          disabled={isSubmitting}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                  placeholder="Any additional notes or special instructions..."
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
                disabled={isSubmitting || formData.documents.length === 0}
                className="min-w-32"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Fee Calculation & Info */}
      <div className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Fee Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billingBreakdown ? (
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
                  <span>{BillingCalculator.formatCurrency(billingBreakdown.total)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Fill in plot size and LGA to see fee calculation
              </p>
            )}

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Service Types</h4>
              <div className="text-xs space-y-1 text-gray-600">
                <div><strong>Fresh Survey:</strong> New survey with coordinates</div>
                <div><strong>Existing Coordinates:</strong> Use your survey points</div>
                <div><strong>Direct Verification:</strong> Verify existing survey</div>
                <div><strong>Retaking Points:</strong> Field verification</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Processing Time</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Fresh Survey:</strong> 3-4 months from point picking</div>
                <div><strong>Existing Coordinates:</strong> 3-4 months from submission</div>
                <div><strong>Verification:</strong> 1 month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}