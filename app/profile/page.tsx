'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseApi } from '../../lib/supabase-api';
import { supabase } from '../../lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Star, Mail, Phone, Calendar, Home, Heart, Activity, Settings, User } from 'lucide-react';
import { toast } from "sonner";

// Define interfaces for our data structures
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  initials: string;
  gradient: string;
  rating: number;
  profileCompletion: number;
  profilePicture?: string;
  membership: Membership;
  stats: UserStats;
  preferences: UserPreferences;
  notifications: NotificationPreferences;
}

interface Membership {
  type: string;
  expiryDate: string;
}

interface UserStats {
  propertiesViewed: number;
  savedFavorites: number;
  toursScheduled: number;
  communityPosts: number;
}

interface UserPreferences {
  priceRange: {
    min: number;
    max: number;
  };
  locations: string[];
  propertyTypes: string[];
  bedrooms: number;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

interface ActivityItem {
  id: string;
  type: 'viewed' | 'favorited' | 'scheduled' | 'contacted' | 'searched';
  icon: string;
  color: string;
  action: string;
  detail: string;
  time: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  image: string;
}

// User Profile state management
class UserProfile {
  private currentUser: User | null = null;
  private activities: ActivityItem[] = [];
  private favorites: Property[] = [];
  private userProperties: Property[] = [];

  constructor(private onUpdate: () => void) {
    this.initializeUserProfile();
  }

  private async initializeUserProfile(): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Initialize user with database data and defaults
      this.currentUser = {
        id: profile.id,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email,
        phone: profile.phone_number || '',
        role: 'Member', // Default role
        initials: this.generateInitials(profile.first_name, profile.last_name),
        gradient: 'from-indigo-400 to-purple-500', // Default gradient
        rating: 4.5, // Default rating
        profileCompletion: this.calculateProfileCompletion(profile),
        profilePicture: profile.profile_picture || undefined,
        membership: {
          type: 'Free',
          expiryDate: 'N/A'
        },
        stats: await this.getUserStats(user.id),
        preferences: {
          priceRange: { min: 0, max: 1000000 },
          locations: [],
          propertyTypes: [],
          bedrooms: 0
        },
        notifications: {
          email: true,
          sms: false
        }
      };

      // Load user data
      await Promise.all([
        this.loadActivities(user.id),
        this.loadFavorites(user.id),
        this.loadUserProperties(user.id)
      ]);

      this.onUpdate();
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  }

  private generateInitials(firstName: string, lastName: string): string {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  }

  private calculateProfileCompletion(profile: any): number {
    let completion = 0;
    if (profile.first_name) completion += 25;
    if (profile.last_name) completion += 25;
    if (profile.phone_number) completion += 25;
    if (profile.profile_picture) completion += 25;
    return completion;
  }

  private async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get user's properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      // For now, return basic stats - these would need additional tables for full functionality
      return {
        propertiesViewed: 0, // Would need view tracking table
        savedFavorites: 0, // Would need favorites table
        toursScheduled: 0, // Would need tours table
        communityPosts: propertiesCount || 0 // Using properties as community posts for now
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        propertiesViewed: 0,
        savedFavorites: 0,
        toursScheduled: 0,
        communityPosts: 0
      };
    }
  }

  private async loadActivities(userId: string): Promise<void> {
    try {
      // Get user's recent properties for activity
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading activities:', error);
        return;
      }

      // Convert properties to activities
      this.activities = (properties || []).map((prop, index) => ({
        id: `activity-${prop.id}`,
        type: 'property_created' as any,
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: 'blue',
        action: 'Created Property',
        detail: prop.title,
        time: this.getRelativeTime(prop.created_at)
      }));
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }

  private async loadFavorites(userId: string): Promise<void> {
    // For now, no favorites system exists - would need a favorites table
    this.favorites = [];
  }

  private async loadUserProperties(userId: string): Promise<void> {
    try {
      const response = await supabaseApi.getProperties({ user_id: userId, limit: 10 });
      if (response.success) {
        this.userProperties = response.data.map(prop => ({
          id: prop.id,
          title: prop.title,
          address: prop.location,
          price: prop.current_worth || 0,
          image: prop.images?.[0]?.image_url || prop.image_url || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user properties:', error);
    }
  }

  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  }

  // Public methods for UI interactions
  public switchTab(tabName: string, button: HTMLElement): void {
    // Remove active class from all buttons
    document.querySelectorAll('.tab-active').forEach(btn => {
      btn.classList.remove('tab-active');
      btn.classList.add('text-gray-600', 'hover:bg-gray-100');
    });

    // Add active class to clicked button
    button.classList.add('tab-active');
    button.classList.remove('text-gray-600', 'hover:bg-gray-100');

    // Update content based on tab
    const content = document.getElementById('tabContent');
    if (!content) return;

    switch(tabName) {
      case 'overview':
        content.innerHTML = this.renderOverviewTab();
        break;
      case 'properties':
        content.innerHTML = this.renderPropertiesTab();
        break;
      case 'favorites':
        content.innerHTML = this.renderFavoritesTab();
        break;
      case 'activity':
        content.innerHTML = this.renderActivityTab();
        break;
      case 'settings':
        content.innerHTML = this.renderSettingsTab();
        break;
    }
  }

  private renderOverviewTab(): string {
    if (!this.currentUser) return '<div>Loading...</div>';

    return `
      <div id="overview" class="tab-content">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- Stat Cards -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-600">Properties Listed</p>
                <p class="text-2xl font-bold text-gray-900">${this.currentUser.stats.communityPosts}</p>
                <p class="text-sm text-gray-600">Your active listings</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-green-600">Profile Completion</p>
                <p class="text-2xl font-bold text-gray-900">${this.currentUser.profileCompletion}%</p>
                <p class="text-sm text-gray-600">Complete your profile</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-purple-600">Member Since</p>
                <p class="text-2xl font-bold text-gray-900">${new Date().getFullYear()}</p>
                <p class="text-sm text-gray-600">Active member</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-4">
            ${this.activities.slice(0, 3).map(activity => `
              <div class="activity-item flex items-start space-x-4 p-4 rounded-lg">
                <div class="w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-${activity.color}-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${activity.icon}" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">${activity.action}</p>
                  <p class="text-sm text-gray-600">${activity.detail}</p>
                  <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Profile Summary -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-medium text-gray-900 mb-2">Contact Information</h4>
              <p class="text-sm text-gray-600">Email: ${this.currentUser.email}</p>
              <p class="text-sm text-gray-600">Phone: ${this.currentUser.phone || 'Not provided'}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-medium text-gray-900 mb-2">Account Status</h4>
              <p class="text-sm text-gray-600">Role: ${this.currentUser.role}</p>
              <p class="text-sm text-gray-600">Rating: ${this.currentUser.rating}/5.0</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderPropertiesTab(): string {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${this.userProperties.length > 0 ? this.userProperties.map(property => `
          <div class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='/properties/${property.id}'">
            <div class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-white font-semibold">Property Image</span>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">${property.title}</h4>
            <p class="text-gray-600 text-sm mb-2">${property.address}</p>
            <p class="text-lg font-bold text-indigo-600">₦${property.price.toLocaleString()}</p>
          </div>
        `).join('') : `
          <div class="col-span-full text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Listed Properties</h3>
            <p class="text-gray-600 mb-4">You haven't listed any properties yet.</p>
            <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors" onclick="window.location.href='/add-property'">
              List Your First Property
            </button>
          </div>
        `}
      </div>
    `;
  }

  private renderFavoritesTab(): string {
    return `
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Favorite Properties</h3>
        <p class="text-gray-600 mb-4">You haven't saved any properties to your favorites yet.</p>
        <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors" onclick="window.location.href='/properties'">
          Browse Properties
        </button>
      </div>
    `;
  }

  private renderActivityTab(): string {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Activity History</h3>
          <select class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
            <option>All time</option>
          </select>
        </div>
        <div class="space-y-4">
          ${this.activities.length > 0 ? this.activities.map(activity => `
            <div class="activity-item flex items-start space-x-4 p-4 rounded-lg">
              <div class="w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-${activity.color}-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${activity.icon}" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">${activity.action}</p>
                <p class="text-sm text-gray-600">${activity.detail}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
              </div>
            </div>
          `).join('') : `
            <div class="text-center py-12">
              <p class="text-gray-600">No recent activity to show.</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  private renderSettingsTab(): string {
    if (!this.currentUser) return '<div>Loading...</div>';

    return `
      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input type="text" id="firstName" value="${this.currentUser.firstName}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input type="text" id="lastName" value="${this.currentUser.lastName}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" id="email" value="${this.currentUser.email}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" readonly>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input type="tel" id="phone" value="${this.currentUser.phone}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Email Notifications</p>
                <p class="text-sm text-gray-600">Receive updates about new properties and market insights</p>
              </div>
              <button class="relative inline-flex h-6 w-11 items-center rounded-full ${this.currentUser.notifications.email ? 'bg-indigo-600' : 'bg-gray-200'} transition-colors" onclick="profile.toggleNotification('email', this)">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${this.currentUser.notifications.email ? 'translate-x-6' : 'translate-x-1'}"></span>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">SMS Notifications</p>
                <p class="text-sm text-gray-600">Get instant alerts for price changes and new listings</p>
              </div>
              <button class="relative inline-flex h-6 w-11 items-center rounded-full ${this.currentUser.notifications.sms ? 'bg-indigo-600' : 'bg-gray-200'} transition-colors" onclick="profile.toggleNotification('sms', this)">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${this.currentUser.notifications.sms ? 'translate-x-6' : 'translate-x-1'}"></span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex space-x-4">
          <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors" onclick="profile.saveSettings()">
            Save Changes
          </button>
          <button class="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors" onclick="profile.resetSettings()">
            Reset
          </button>
        </div>
      </div>
    `;
  }

  public async uploadPhoto(): Promise<void> {
    if (!this.currentUser) return;

    // Create file input if it doesn't exist
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.');
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB.');
          return;
        }

        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${this.currentUser!.id}/profile-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (error) {
          console.error('Error uploading file:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        // Update profile in database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_picture: publicUrl })
          .eq('id', this.currentUser!.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          alert('Failed to update profile. Please try again.');
          return;
        }

        // Update local state
        if (this.currentUser) {
          this.currentUser.profilePicture = publicUrl;
          this.currentUser.profileCompletion = this.calculateProfileCompletion({
            first_name: this.currentUser.firstName,
            last_name: this.currentUser.lastName,
            phone_number: this.currentUser.phone,
            profile_picture: publicUrl
          });
        }

        this.onUpdate();
        alert('Profile photo updated successfully! ✅');

      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Failed to upload photo. Please try again.');
      }
    };

    // Trigger file selection
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  public editProfile(): void {
    alert('Profile editing form would open here with fields for:\n• Personal information\n• Bio/description\n• Contact preferences\n• Professional details');
  }

  public manageMembership(): void {
    alert('Membership management page would open showing:\n• Current plan details\n• Billing history\n• Upgrade/downgrade options\n• Payment methods');
  }

  public viewProperty(id: string): void {
    alert(`Opening detailed view for favorited property #${id}`);
  }

  public listProperty(): void {
    alert('Property listing wizard would open to guide you through:\n• Property details\n• Photos upload\n• Pricing\n• Description\n• Scheduling');
  }

  public async saveSettings(): Promise<void> {
    if (!this.currentUser) return;

    try {
      // Get form values
      const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value || '';
      const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value || '';
      const phone = (document.getElementById('phone') as HTMLInputElement)?.value || '';

      // Update profile in database
      const response = await supabaseApi.updateUser(this.currentUser.id, {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone
      });

      if (response.success) {
        // Update local state
        this.currentUser.firstName = firstName;
        this.currentUser.lastName = lastName;
        this.currentUser.phone = phone;
        this.currentUser.initials = this.generateInitials(firstName, lastName);
        this.currentUser.profileCompletion = this.calculateProfileCompletion({
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          profile_picture: null // Would need to handle profile picture separately
        });

        this.onUpdate();
        alert('Settings saved successfully! ✅');
      } else {
        alert('Error saving settings: ' + response.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  }

  public resetSettings(): void {
    if (!this.currentUser) return;

    // Reset notification preferences
    this.currentUser.notifications.email = true;
    this.currentUser.notifications.sms = false;

    // Re-render settings tab
    const activeTab = document.querySelector('.tab-active') as HTMLElement;
    if (activeTab && activeTab.getAttribute('onclick')?.includes('settings')) {
      this.switchTab('settings', activeTab);
    }

    alert('Settings have been reset to default values.');
  }

  public toggleNotification(type: 'email' | 'sms', button: HTMLElement): void {
    if (!this.currentUser) return;

    const isOn = button.classList.contains('bg-indigo-600');
    const span = button.querySelector('span') as HTMLElement;

    if (isOn) {
      button.classList.remove('bg-indigo-600');
      button.classList.add('bg-gray-200');
      span.classList.remove('translate-x-6');
      span.classList.add('translate-x-1');
      this.currentUser.notifications[type] = false;
    } else {
      button.classList.remove('bg-gray-200');
      button.classList.add('bg-indigo-600');
      span.classList.remove('translate-x-1');
      span.classList.add('translate-x-6');
      this.currentUser.notifications[type] = true;
    }
  }

  public updateProfilePicture(profilePictureUrl: string): void {
    if (!this.currentUser) return;

    this.currentUser.profilePicture = profilePictureUrl;
    this.currentUser.profileCompletion = this.calculateProfileCompletion({
      first_name: this.currentUser.firstName,
      last_name: this.currentUser.lastName,
      phone_number: this.currentUser.phone,
      profile_picture: profilePictureUrl
    });

    this.onUpdate();
  }

  // Getter for current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Getters for other data
  public getActivities(): ActivityItem[] {
    return this.activities;
  }

  public getFavorites(): Property[] {
    return this.favorites;
  }

  public getUserProperties(): Property[] {
    return this.userProperties;
  }
}

// Profile Page Component
const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Initialize profile
    const profile = new UserProfile(() => {
      setUserProfile(profile);
      setLoading(false);
    });

    // Store profile instance globally for onclick handlers
    (window as any).profile = profile;

    return () => {
      // Cleanup
      delete (window as any).profile;
    };
  }, [isAuthenticated]);

  // Set initial tab content when userProfile is ready
  useEffect(() => {
    if (userProfile) {
      const content = document.getElementById('tabContent');
      if (content) {
        const overviewButton = document.querySelector('.tab-active') as HTMLElement;
        if (overviewButton) {
          userProfile.switchTab('overview', overviewButton);
        }
      }
    }
  }, [userProfile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile || !user) return;

    setUploadingPhoto(true);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.');
        return;
      }

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload image. Please try again.');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error('Failed to update profile. Please try again.');
        return;
      }

      // Update local state
      userProfile.updateProfilePicture(publicUrl);
      toast.success('Profile photo updated successfully!');

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const user = userProfile?.getCurrentUser();
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload profile picture"
        title="Upload profile picture"
      />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="py-4 sm:py-6 lg:py-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Profile Hero Card */}
        <Card className="mb-6 sm:mb-8 overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border-white/20">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }} />

            <CardContent className="relative p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 sm:space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Avatar Section */}
                <div className="relative self-center lg:self-start cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 ring-4 ring-white/50 shadow-2xl group-hover:ring-indigo-300 transition-all">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${user.gradient} flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold`}>
                        {user.initials}
                      </div>
                    )}
                    <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl font-bold">{user.initials}</AvatarFallback>
                  </Avatar>
                  {/* Camera overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4 sm:space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 sm:space-y-4 lg:space-y-0">
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                        {user.firstName} {user.lastName}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <Badge variant="secondary" className="px-2 sm:px-3 py-1 self-start">
                          <User className="w-3 h-3 mr-1" />
                          {user.role}
                        </Badge>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-1 fill-current" />
                          <span className="font-semibold text-sm sm:text-base">{user.rating}</span>
                          <span className="text-gray-500 ml-1 text-sm">(3.5/5.0)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                    <div className="w-full max-w-full space-y-4 sm:space-y-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 sm:space-y-4 lg:space-y-0">
                        <div>
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                            {user.firstName} {user.lastName}
                          </h2>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <Badge variant="secondary" className="px-3 py-1 self-start">
                              <User className="w-3 h-3 mr-1" />
                              {user.role}
                            </Badge>
                            <div className="flex items-center text-yellow-500">
                              <Star className="w-5 h-5 mr-1 fill-current" />
                              <span className="font-semibold text-base">{user.rating}</span>
                              <span className="text-gray-500 ml-1 text-sm">(4.5/5.0)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                          <span className="text-sm font-bold text-indigo-600">{user.profileCompletion}%</span>
                        </div>
                        <Progress value={user.profileCompletion} className="h-2 sm:h-3 bg-gray-200" />
                      </div>

                      {/* Contact Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/60 w-full">
                          <Mail className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/60 w-full">
                          <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/60 w-full">
                          <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Member Since</p>
                            <p className="text-sm font-semibold text-gray-900">{new Date().getFullYear()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Modern Tabs Section */}
        <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-white/20">
          <Tabs defaultValue="overview" className="w-full">
            <CardHeader className="pb-3 sm:pb-4">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100/80 h-auto p-1">
                <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3 text-xs">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="properties" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3 text-xs">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Properties</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3 text-xs">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Favorites</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3 text-xs">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:px-3 text-xs">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <OverviewTab user={user} userProfile={userProfile} />
              <PropertiesTab userProfile={userProfile} />
              <FavoritesTab />
              <ActivityTab userProfile={userProfile} />
              <SettingsTab user={user} userProfile={userProfile} />
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ user, userProfile }: { user: User; userProfile: UserProfile | null }) => {
  if (!user || !userProfile) return <div>Loading...</div>;
  
  const activities = userProfile.getActivities();
  
  return (
    <TabsContent value="overview" className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Properties Listed</p>
                <p className="text-3xl font-bold text-gray-900">{user.stats.communityPosts}</p>
                <p className="text-sm text-gray-600">Your active listings</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Profile Completion</p>
                <p className="text-3xl font-bold text-gray-900">{user.profileCompletion}%</p>
                <p className="text-sm text-gray-600">Complete your profile</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <User className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Member Since</p>
                <p className="text-3xl font-bold text-gray-900">{new Date().getFullYear()}</p>
                <p className="text-sm text-gray-600">Active member</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.slice(0, 3).map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50/50">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.detail}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity to show.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="font-medium">{user.rating}/5.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

const PropertiesTab = ({ userProfile }: { userProfile: UserProfile | null }) => {
  if (!userProfile) return <div>Loading...</div>;
  
  const properties = userProfile.getUserProperties();
  
  return (
    <TabsContent value="properties" className="space-y-6">
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative overflow-hidden rounded-t-xl">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold">Property Image</span>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90">
                    Listed
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {property.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  {property.address}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-indigo-600">
                    ₦{property.price.toLocaleString()}
                  </p>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Listed Properties</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't listed any properties yet. Start by adding your first property to showcase to potential buyers.
            </p>
            <Button variant="gradient" size="lg">
              <Home className="w-4 h-4 mr-2" />
              List Your First Property
            </Button>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
};

const FavoritesTab = () => {
  return (
    <TabsContent value="favorites" className="space-y-6">
      <Card>
        <CardContent className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Favorite Properties</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't saved any properties to your favorites yet. Browse our listings to find properties you love.
          </p>
          <Button variant="gradient" size="lg">
            <Heart className="w-4 h-4 mr-2" />
            Browse Properties
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

const ActivityTab = ({ userProfile }: { userProfile: UserProfile | null }) => {
  if (!userProfile) return <div>Loading...</div>;
  
  const activities = userProfile.getActivities();
  
  return (
    <TabsContent value="activity" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Activity History</span>
            </CardTitle>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" aria-label="Filter activity history by time period">
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.detail}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity to show.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

const SettingsTab = ({ user, userProfile }: { user: User; userProfile: UserProfile | null }) => {
  if (!user || !userProfile) return <div>Loading...</div>;
  
  return (
    <TabsContent value="settings" className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <Input
                id="firstName"
                defaultValue={user.firstName}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <Input
                id="lastName"
                defaultValue={user.lastName}
                placeholder="Enter your last name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input
                id="phone"
                type="tel"
                defaultValue={user.phone}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates about new properties and market insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Off</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  defaultChecked={user.notifications.email}
                  aria-label="Toggle email notifications"
                  title="Enable or disable email notifications"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm text-gray-600">On</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Get instant alerts for price changes and new listings</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Off</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  defaultChecked={user.notifications.sms}
                  aria-label="Toggle SMS notifications"
                  title="Enable or disable SMS notifications"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm text-gray-600">On</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <Button
          variant="gradient"
          size="lg"
          onClick={() => userProfile.saveSettings()}
          className="flex-1 sm:flex-none"
        >
          <Settings className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => userProfile.resetSettings()}
          className="flex-1 sm:flex-none"
        >
          Reset to Default
        </Button>
      </div>
    </TabsContent>
  );
};

export default ProfilePage;
