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

interface TitleDocumentFormData {
  // Service Type
  documentType: 'deem-grant' | 'governor-consent' | 'regularisation';

  // Applicant Information
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;

  // Property Information
  propertyAddress: string;
  state: string;
  lga: string;

  // Documents
  documents: File[];

  // Additional Information
  description: string;
}

const initialFormData: TitleDocumentFormData = {
  documentType: 'deem-grant',
  applicantName: '',
  applicantEmail: '',
  applicantPhone: '',
  propertyAddress: '',
  state: '',
  lga: '',
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

export function TitleDocumentSection() {
  const [formData, setFormData] = useState<TitleDocumentFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof TitleDocumentFormData, value: string | File[]) => {
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

  const handleSubmit = async () => {
    if (formData.documents.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    if (!formData.applicantName || !formData.propertyAddress || !formData.lga) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmissionStatus('success');
      toast.success('Title document application submitted successfully');

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
      <div className="flex-1 order-1 lg:order-2">
        <Card>
          <CardHeader>
            <CardTitle>Title Document Processing Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {submissionStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Submission Successful</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your title document application has been submitted for processing.
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

            {/* Document Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Document Type</h3>
              <div className="space-y-2">
                <Label>Select the type of title document you need *</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value: any) => handleInputChange('documentType', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deem-grant">Deem Grant (Fresh C of O) - Freehold property</SelectItem>
                    <SelectItem value="governor-consent">Governor's Consent - Land with existing C of O</SelectItem>
                    <SelectItem value="regularisation">Regularisation - Properties on main land</SelectItem>
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
              </div>
            </div>

            <Separator />

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Document Upload</h3>
              <div className="space-y-2">
                <Label htmlFor="documents">Upload Required Documents *</Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Upload Deed of Assignment, Purchase Receipt, Survey Plan (Record Copy), and other required documents.
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
                disabled={isSubmitting || formData.documents.length === 0}
                className="min-w-32"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Info */}
      <div className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Service Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Document Types:</h4>
              <div className="text-xs space-y-1 text-gray-600">
                <div><strong>Deem Grant:</strong> Fresh C of O for freehold property</div>
                <div><strong>Governor's Consent:</strong> For land with existing C of O</div>
                <div><strong>Regularisation:</strong> For properties on main land</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Required Documents:</h4>
              <div className="text-xs space-y-1 text-gray-600">
                <div>• Deed of Assignment</div>
                <div>• Purchase Receipt</div>
                <div>• Survey Plan (Record Copy)</div>
                <div>• Land Information (where applicable)</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Processing Time</h4>
              <div className="text-xs text-gray-600">
                4-6 weeks from submission
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}