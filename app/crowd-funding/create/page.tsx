'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Upload, Camera, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import useSWR from 'swr';

function CrowdFundingCreatePageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    target_amount: '',
    min_contribution: '1000',
    max_contribution: '',
    deadline: '',
    category_id: '',
    features: [] as string[]
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Use SWR for contacts
  const { data: contacts = [] } = useSWR(
    'crowd-funding-contacts',
    async () => {
      const { data: referrals, error: referralsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone_number')
        .neq('id', user?.id);

      if (referralsError) throw referralsError;
      return referrals || [];
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.title || !formData.description || !formData.location || !formData.price || !formData.target_amount || !formData.min_contribution) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate amounts
    const price = parseFloat(formData.price);
    const targetAmount = parseFloat(formData.target_amount);
    const minContribution = parseFloat(formData.min_contribution);
    const maxContribution = formData.max_contribution ? parseFloat(formData.max_contribution) : null;

    if (targetAmount > price) {
      toast.error('Target amount cannot exceed property value');
      return;
    }

    if (minContribution > targetAmount) {
      toast.error('Minimum contribution cannot exceed target amount');
      return;
    }

    if (maxContribution && maxContribution < minContribution) {
      toast.error('Maximum contribution cannot be less than minimum contribution');
      return;
    }

    // Store form data in localStorage for the summary page
    localStorage.setItem('crowd_funding_form_data', JSON.stringify({
      ...formData,
      selectedContacts
    }));

    // Navigate to summary page
    router.push('/crowd-funding/create/summary');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

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
                onClick={() => router.push('/crowd-funding')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Campaigns
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create New Campaign</h1>
                <p className="text-sm text-gray-600">Launch a crowd funding campaign for your property</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Property Information Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-gray-500" />
                  Property Information
                </CardTitle>
                <CardDescription>Basic details about your property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Property Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., 3 Bedroom Apartment in Lekki"
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Lekki Phase 1, Lagos"
                      className="h-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the property, its potential, and why it's a good investment opportunity..."
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700">Property Value (₦) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="50000000"
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">Property Type *</Label>

                    {/* Replaced custom Select with native select for correct dropdown positioning */}
                    {React.createElement(
                      'select',
                      {
                        id: 'category',
                        value: formData.category_id,
                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, category_id: e.target.value })),
                        className: 'h-10 w-full rounded-md border border-gray-200 px-3 text-sm bg-white'
                      },
                      React.createElement('option', { value: '' }, 'Select property type'),
                      React.createElement('option', { value: '550e8400-e29b-41d4-a716-446655440001' }, 'Residential'),
                      React.createElement('option', { value: '550e8400-e29b-41d4-a716-446655440002' }, 'Commercial'),
                      React.createElement('option', { value: '550e8400-e29b-41d4-a716-446655440003' }, 'Land')
                    )}

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funding Configuration Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5 text-gray-500" />
                  Funding Configuration
                </CardTitle>
                <CardDescription>Set up funding and contribution details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_amount" className="text-sm font-medium text-gray-700">Target Amount (₦) *</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={formData.target_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                    placeholder="10000000"
                    className="h-10"
                    required
                  />
                  <p className="text-xs text-gray-500">The total amount you want to raise for this property (cannot exceed property value)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_contribution" className="text-sm font-medium text-gray-700">Min Contribution (₦) *</Label>
                    <Input
                      id="min_contribution"
                      type="number"
                      value={formData.min_contribution}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_contribution: e.target.value }))}
                      placeholder="1000"
                      className="h-10"
                      required
                    />
                    <p className="text-xs text-gray-500">Minimum amount others must contribute</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_contribution" className="text-sm font-medium text-gray-700">Max Contribution (₦)</Label>
                    <Input
                      id="max_contribution"
                      type="number"
                      value={formData.max_contribution}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_contribution: e.target.value }))}
                      placeholder="Optional"
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500">Maximum amount per contributor (optional)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">Campaign Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Features Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-gray-500" />
                  Property Features
                </CardTitle>
                <CardDescription>Specify property features and amenities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Swimming Pool', 'Gym', 'Parking', 'Security', 'Generator', 'Water Treatment', 'Elevator', 'Balcony'].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={feature}
                        checked={formData.features.includes(feature)}
                        onCheckedChange={() => toggleFeature(feature)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={feature} className="text-xs cursor-pointer flex-1 leading-tight">{feature}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Media Upload Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="h-5 w-5 text-gray-500" />
                  Property Media
                </CardTitle>
                <CardDescription>Upload images and videos to showcase your property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-gray-400">
                  <div className="text-center">
                    <Upload className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3" />
                    <div className="space-y-1">
                      <h3 className="text-sm md:text-base font-medium text-gray-900">Upload Property Media</h3>
                      <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Drag and drop or click to upload images and videos</p>
                      <p className="text-xs text-gray-600 sm:hidden">Tap to upload images and videos</p>
                      <label htmlFor="media-upload" className="cursor-pointer mt-3 inline-block">
                        <span className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                          Choose Files
                        </span>
                        <input
                          id="media-upload"
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {mediaFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                            {file.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Upload className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMediaFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            aria-label={`Remove ${file.name}`}
                            title={`Remove ${file.name}`}
                          >
                            <Plus className="h-3 w-3 rotate-45" />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Selection */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-gray-500" />
                  Invite Contributors
                </CardTitle>
                <CardDescription>Select contacts to invite for co-investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No contacts available</p>
                      <p className="text-xs text-gray-400 mt-1">Add contacts to invite them</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                          <Checkbox
                            id={`contact-${contact.id}`}
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={() => toggleContactSelection(contact.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedContacts.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/crowd-funding')} className="flex-1 h-12">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 h-12 bg-gray-900 hover:bg-gray-800">
                {loading ? 'Processing...' : 'Continue to Summary'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
}

export default function CrowdFundingCreatePage() {
  return (
    <ProtectedRoute>
      <CrowdFundingCreatePageContent />
    </ProtectedRoute>
  );
}