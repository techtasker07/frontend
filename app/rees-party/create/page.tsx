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

function ReesPartyCreatePageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    venue_details: '',
    event_date: '',
    event_time: '',
    dress_code: '',
    target_amount: '',
    contribution_per_person: '5000',
    creator_contribution: '',
    max_participants: '',
    deadline: '',
    category_id: '',
    requirements: [] as string[]
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Use SWR for contacts
  const { data: contacts = [] } = useSWR(
    'rees-party-contacts',
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
    if (!formData.title || !formData.description || !formData.location || !formData.event_date || !formData.target_amount || !formData.contribution_per_person || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate creator contribution
    const targetAmount = parseFloat(formData.target_amount);
    const minContribution = parseFloat(formData.contribution_per_person);
    const creatorContribution = parseFloat(formData.creator_contribution || '0');

    if (creatorContribution < minContribution) {
      toast.error(`Your contribution must be at least ₦${minContribution.toLocaleString()} (minimum per person)`);
      return;
    }

    if (creatorContribution > targetAmount) {
      toast.error(`Your contribution cannot exceed the target amount of ₦${targetAmount.toLocaleString()}`);
      return;
    }

    // Store form data in localStorage for the summary page
    localStorage.setItem('rees_party_form_data', JSON.stringify({
      ...formData,
      selectedContacts
    }));

    // Navigate to summary page
    router.push('/rees-party/create/summary');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(requirement)
        ? prev.requirements.filter(r => r !== requirement)
        : [...prev.requirements, requirement]
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
                onClick={() => router.push('/rees-party')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Parties
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create New Party</h1>
                <p className="text-sm text-gray-600">Plan an amazing party and invite your contacts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Party Information Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-gray-500" />
                  Party Information
                </CardTitle>
                <CardDescription>Basic details about your party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Party Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., John's Birthday Bash"
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
                    placeholder="Describe the party theme, activities, and what makes it special..."
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date" className="text-sm font-medium text-gray-700">Event Date *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_time" className="text-sm font-medium text-gray-700">Event Time</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_details" className="text-sm font-medium text-gray-700">Venue Details</Label>
                  <Textarea
                    id="venue_details"
                    value={formData.venue_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_details: e.target.value }))}
                    placeholder="Specific venue address, parking info, etc."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dress_code" className="text-sm font-medium text-gray-700">Dress Code</Label>
                    <Input
                      id="dress_code"
                      value={formData.dress_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, dress_code: e.target.value }))}
                      placeholder="e.g., Smart Casual, Black Tie"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>

                    {/* Replaced custom Select with native select for correct dropdown positioning */}
                    {React.createElement(
                      'select',
                      {
                        id: 'category',
                        value: formData.category_id,
                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, category_id: e.target.value })),
                        className: 'h-10 w-full rounded-md border border-gray-200 px-3 text-sm bg-white'
                      },
                      React.createElement('option', { value: '' }, 'Select category'),
                      React.createElement('option', { value: 'birthday' }, 'Birthday'),
                      React.createElement('option', { value: 'wedding' }, 'Wedding'),
                      React.createElement('option', { value: 'graduation' }, 'Graduation'),
                      React.createElement('option', { value: 'corporate' }, 'Corporate'),
                      React.createElement('option', { value: 'other' }, 'Other')
                    )}

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contribution Configuration Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5 text-gray-500" />
                  Contribution Configuration
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
                    placeholder="500000"
                    className="h-10"
                    required
                  />
                  <p className="text-xs text-gray-500">The total amount you want to raise for this party</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contribution_per_person" className="text-sm font-medium text-gray-700">Contribution per Person (₦) *</Label>
                    <Input
                      id="contribution_per_person"
                      type="number"
                      value={formData.contribution_per_person}
                      onChange={(e) => setFormData(prev => ({ ...prev, contribution_per_person: e.target.value }))}
                      placeholder="5000"
                      className="h-10"
                      required
                    />
                    <p className="text-xs text-gray-500">Minimum amount others must contribute</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creator_contribution" className="text-sm font-medium text-gray-700">Your Contribution (₦) *</Label>
                    <Input
                      id="creator_contribution"
                      type="number"
                      value={formData.creator_contribution}
                      onChange={(e) => setFormData(prev => ({ ...prev, creator_contribution: e.target.value }))}
                      placeholder="Enter your contribution amount"
                      className="h-10"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Min: ₦{formData.contribution_per_person ? parseFloat(formData.contribution_per_person).toLocaleString() : '0'} |
                      Max: ₦{formData.target_amount ? parseFloat(formData.target_amount).toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_participants" className="text-sm font-medium text-gray-700">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                      placeholder="Optional"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">Payment Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="h-10"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-gray-500" />
                  Additional Requirements
                </CardTitle>
                <CardDescription>Specify any special requirements or preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Bring a dish', 'BYOB', 'Plus one allowed', 'Family friendly', 'Music preference', 'Dietary restrictions', 'Transportation needed', 'Accommodation needed'].map((requirement) => (
                    <div key={requirement} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={requirement}
                        checked={formData.requirements.includes(requirement)}
                        onCheckedChange={() => toggleRequirement(requirement)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={requirement} className="text-xs cursor-pointer flex-1 leading-tight">{requirement}</Label>
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
                  Party Media
                </CardTitle>
                <CardDescription>Upload images and videos to showcase your party</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-gray-400">
                  <div className="text-center">
                    <Upload className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-3" />
                    <div className="space-y-1">
                      <h3 className="text-sm md:text-base font-medium text-gray-900">Upload Party Media</h3>
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
                  Invite Participants
                </CardTitle>
                <CardDescription>Select contacts to invite to your party</CardDescription>
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
              <Button type="button" variant="outline" onClick={() => router.push('/rees-party')} className="flex-1 h-12">
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

export default function ReesPartyCreatePage() {
  return (
    <ProtectedRoute>
      <ReesPartyCreatePageContent />
    </ProtectedRoute>
  );
}