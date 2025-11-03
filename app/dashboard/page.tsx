'use client';

import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../lib/supabase-api';
import { supabase } from '../../lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define interfaces for our data structures
interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

interface DashboardButton {
  id: string;
  label: string;
  icon: string;
  count: number;
  route: string;
  color: string;
}

interface PropertyCard {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  status: string;
  created_at: string;
}

// Dashboard component
const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Enhanced navigation items mirroring the general theme sidebar
  const [navigationItems] = useState<NavigationItem[]>([
    { id: 'home', label: 'Home', icon: '/images/home.gif', active: true },
    { id: 'poll', label: 'Poll', icon: '/images/poll.gif', active: false },
    { id: 'marketplace', label: 'Marketplace', icon: '/images/market_place.gif', active: false },
    { id: 'prospect', label: 'Prospect', icon: '/images/prospects.gif', active: false },
    { id: 'verifications', label: 'Verifications', icon: '/images/verifications.gif', active: false },
    { id: 'investment', label: 'Investment', icon: '/images/investment.gif', active: false },
    { id: 'consultations', label: 'Consultations', icon: '/images/consultation.gif', active: false }
  ]);

  const [dashboardButtons, setDashboardButtons] = useState<DashboardButton[]>([
    { id: 'Crowd-Funding', label: 'Crowd Funding', icon: '/images/crowd-funding.gif', count: 0, route: '/crowd-funding', color: 'gray' },
    { id: 'contacts', label: 'Contacts', icon: '/images/contact.gif', count: 0, route: '/contacts', color: 'gray' },
    { id: 'completed', label: 'Completed', icon: '/images/completed.gif', count: 0, route: '/completed', color: 'gray' },
    { id: 'ongoing', label: 'Ongoing', icon: '/images/ongoing.gif', count: 0, route: '/ongoing', color: 'gray' }
  ]);

  const [activeTab, setActiveTab] = useState<'poll' | 'marketplace'>('poll');
  const [activeSubTab, setActiveSubTab] = useState<'recent' | 'completed' | 'ongoing'>('recent');
  const [pollProperties, setPollProperties] = useState<PropertyCard[]>([]);
  const [marketplaceProperties, setMarketplaceProperties] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(true);

  // New states for status-based view
  const [activeStatus, setActiveStatus] = useState<string | null>('completed');
  const [activeCategory, setActiveCategory] = useState<string>('poll');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoryData, setCategoryData] = useState<Record<string, PropertyCard[]>>({});
  const [activeSingleCategory, setActiveSingleCategory] = useState<string | null>(null);

  // Categories for the new tabbed view
  const categories = [
    { id: 'poll', label: 'Poll' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'prospect', label: 'Prospect' },
    { id: 'Verifications', label: 'Verifications' },
    { id: 'Investment', label: 'Investment' }
  ];

  useEffect(() => {
    // Only redirect if we're not loading and definitely not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only fetch data if we're authenticated and not loading
    if (!authLoading && isAuthenticated) {
      initializeDashboard();
    }
  }, [isAuthenticated, authLoading]);

  // Initialize with completed data by default
  useEffect(() => {
    if (isAuthenticated && !authLoading && activeStatus === 'completed') {
      fetchCategoryData('completed');
    }
  }, [isAuthenticated, authLoading, activeStatus]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch counts for dashboard buttons from database
      const [
        pollResponse,
        marketplaceResponse,
        prospectsResponse,
        verificationsCount,
        investmentCount,
        completedCount,
        ongoingCount,
        contactsCount,
        crowdFundingDueCount,
        reesPartyDueCount
      ] = await Promise.all([
        supabaseApi.getProperties({ source: 'poll', limit: 100 }),
        supabaseApi.getMarketplaceListings({ limit: 100 }),
        supabaseApi.getUserPropertyAnalyses(100),
        // Fetch verifications count
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('type', 'verifications'),
        // Fetch investment count
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('type', 'investment'),
        // Fetch completed activities count
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed'),
        // Fetch ongoing activities count (recent items from last 7 days across all categories)
        (async () => {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

          const [
            pollCount,
            marketplaceCount,
            prospectsCount,
            verificationsCount,
            investmentCount
          ] = await Promise.all([
            // Poll properties (recent)
            supabase
              .from('properties')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('source', 'poll')
              .gte('created_at', sevenDaysAgo),
            // Marketplace listings (recent)
            supabase
              .from('marketplace_listings')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('created_at', sevenDaysAgo),
            // Prospect analyses (recent)
            supabase
              .from('property_analyses')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('created_at', sevenDaysAgo),
            // Verifications (recent)
            supabase
              .from('properties')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('type', 'verifications')
              .gte('created_at', sevenDaysAgo),
            // Investment (recent)
            supabase
              .from('properties')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('type', 'investment')
              .gte('created_at', sevenDaysAgo),
            // Consultations removed
          ]);

          const totalOngoing = (pollCount.count || 0) + (marketplaceCount.count || 0) + (prospectsCount.count || 0) + (verificationsCount.count || 0) + (investmentCount.count || 0);
          return { count: totalOngoing };
        })(),
        // Fetch contacts count (could be from a contacts table or profiles)
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true }),
        // Fetch Crowd-Funding due count (pending invitations)
        supabase
          .from('crowd_funding_invitations')
          .select('id', { count: 'exact', head: true })
          .eq('invitee_id', user.id)
          .eq('status', 'pending'),
        // Fetch Re-es Party due count (upcoming parties where user hasn't contributed)
        (async () => {
          const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

          // Get upcoming rees parties
          const { data: upcomingParties, error: partiesError } = await supabase
            .from('rees_party_properties')
            .select('id')
            .gte('event_date', currentDate);

          if (partiesError || !upcomingParties) return { count: 0 };

          const partyIds = upcomingParties.map(party => party.id);

          if (partyIds.length === 0) return { count: 0 };

          // Count parties where user hasn't contributed yet
          const { count, error: countError } = await supabase
            .from('rees_party_contributions')
            .select('id', { count: 'exact', head: true })
            .in('property_id', partyIds)
            .eq('contributor_id', user.id);

          if (countError) return { count: 0 };

          // Return the number of upcoming parties minus contributed parties
          return { count: Math.max(0, partyIds.length - (count || 0)) };
        })()
      ]);

      const pollCount = pollResponse.success ? pollResponse.data.length : 0;
      const marketplaceCount = marketplaceResponse.success ? marketplaceResponse.data.length : 0;
      const prospectsCount = prospectsResponse.success ? prospectsResponse.data.length : 0;

      setDashboardButtons(prev => prev.map(btn => {
        switch (btn.id) {
          case 'completed': return { ...btn, count: completedCount.count || 0 };
          case 'ongoing': return { ...btn, count: ongoingCount.count || 0 };
          case 'contacts': return { ...btn, count: contactsCount.count || 0 };
          case 'Crowd-Funding': return { ...btn, count: crowdFundingDueCount.count || 0 };
          default: return btn;
        }
      }));

      // Fetch properties for tabs
      if (pollResponse.success) {
        const pollProps = pollResponse.data.map(prop => ({
          id: prop.id,
          title: prop.title,
          location: prop.location,
          price: prop.current_worth ? `₦${prop.current_worth.toLocaleString()}` : 'Price on request',
          image: prop.image_url || '/api/placeholder/300/200',
          status: 'Active',
          created_at: prop.created_at
        }));
        setPollProperties(pollProps);
      }

      if (marketplaceResponse.success) {
        const marketProps = marketplaceResponse.data.map(prop => ({
          id: prop.id,
          title: prop.title,
          location: prop.location,
          price: `₦${prop.price.toLocaleString()}`,
          image: prop.images?.find(img => img.is_primary)?.image_url || '/api/placeholder/300/200',
          status: 'Available',
          created_at: prop.created_at
        }));
        setMarketplaceProperties(marketProps);
      }

    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarAction = (index: number) => {
    const navItem = navigationItems[index];
    if (!navItem) return;

    // Navigation routes mapping
    const routes = {
      'home': '/',
      'poll': '/properties',
      'marketplace': '/marketplace',
      'prospect': '/prospects',
      'verifications': '/verifications',
      'investment': '/investment',
      'consultations': '/consultations'
    };

    // Navigate to the appropriate route
    const route = routes[navItem.id as keyof typeof routes];
    if (route) {
      router.push(route);
    }
  };

  const handleButtonClick = (buttonId: string) => {
    if (buttonId === 'completed' || buttonId === 'ongoing') {
      setActiveStatus(buttonId);
      setActiveCategory('poll'); // Default to poll
      setCurrentPage(1);
      fetchCategoryData(buttonId);
    } else if (buttonId === 'contacts') {
      // Navigate to dedicated contacts page
      router.push('/contacts');
    } else if (buttonId === 'Crowd-Funding') {
      // Navigate to crowd funding page
      router.push('/crowd-funding');
    } else {
      // For other buttons, keep existing navigation
      const routes = {
        'verifications': '/verifications',
        'investment': '/investment',
        'consultations': '/consultations'
      };
      const route = routes[buttonId as keyof typeof routes];
      if (route) {
        router.push(route);
      }
    }
  };

  const fetchCategoryData = async (status: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const statusFilter = status === 'completed' ? 'completed' : 'ongoing';
      const isRecent = status === 'ongoing'; // Ongoing now shows recent items

      // Fetch data for all categories
      const [
        pollResponse,
        marketplaceResponse,
        prospectsResponse,
        verificationsResponse,
        investmentResponse
      ] = await Promise.all([
        supabaseApi.getProperties({ source: 'poll', limit: 100 }),
        supabaseApi.getMarketplaceListings({ limit: 100 }),
        supabaseApi.getUserPropertyAnalyses(100),
        supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'verifications')
          .eq('status', statusFilter)
          .limit(100),
        supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'investment')
          .eq('status', statusFilter)
          .limit(100)
      ]);

      const newCategoryData: Record<string, PropertyCard[]> = {};

      // Process poll data
      if (pollResponse.success) {
        let filteredPoll = pollResponse.data;
        if (status === 'completed') {
          filteredPoll = filteredPoll.filter(prop => prop.type === 'completed');
        } else if (isRecent) {
          // For ongoing (recent), show recent items
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          filteredPoll = filteredPoll.filter(prop => new Date(prop.created_at) >= sevenDaysAgo);
        } else {
          filteredPoll = filteredPoll.filter(prop => prop.type === 'ongoing' || prop.type === 'active');
        }
        newCategoryData.poll = filteredPoll.map(prop => ({
          id: prop.id,
          title: prop.title,
          location: prop.location,
          price: prop.current_worth ? `₦${prop.current_worth.toLocaleString()}` : 'Price on request',
          image: prop.image_url || '/api/placeholder/300/200',
          status: prop.type || 'active',
          created_at: prop.created_at
        }));
      }

      // Process marketplace data
      if (marketplaceResponse.success) {
        let filteredMarketplace = marketplaceResponse.data;
        if (status === 'completed') {
          filteredMarketplace = filteredMarketplace.filter(prop => prop.is_active === false);
        } else if (isRecent) {
          // For ongoing (recent), show recent items
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          filteredMarketplace = filteredMarketplace.filter(prop => new Date(prop.created_at) >= sevenDaysAgo);
        } else {
          filteredMarketplace = filteredMarketplace.filter(prop => prop.is_active === true);
        }
        newCategoryData.marketplace = filteredMarketplace.map(prop => ({
          id: prop.id,
          title: prop.title,
          location: prop.location,
          price: `₦${prop.price.toLocaleString()}`,
          image: prop.images?.find(img => img.is_primary)?.image_url || '/api/placeholder/300/200',
          status: prop.is_active ? 'available' : 'completed',
          created_at: prop.created_at
        }));
      }

      // Process prospects data
      if (prospectsResponse.success) {
        let filteredProspects = prospectsResponse.data;
        if (status === 'completed') {
          // For completed, include all prospects since analysis is typically completed
          filteredProspects = filteredProspects;
        } else if (isRecent) {
          // For ongoing (recent), show only very recent items (last 24 hours)
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          filteredProspects = filteredProspects.filter(prop => new Date(prop.created_at) >= oneDayAgo);
        } else {
          // For ongoing (active), show only actively ongoing prospects
          filteredProspects = filteredProspects.filter(prop => prop.status === 'ongoing' || prop.status === 'active');
        }
        newCategoryData.prospect = filteredProspects.map(prop => ({
          id: prop.id,
          title: prop.title || 'Prospect Analysis',
          location: prop.location || 'N/A',
          price: 'Analysis Complete',
          image: '/api/placeholder/300/200',
          status: prop.status,
          created_at: prop.created_at
        }));
      }

      // Process verifications data
      if (verificationsResponse.data) {
        newCategoryData.verifications = verificationsResponse.data.map(prop => ({
          id: prop.id,
          title: prop.title || 'Verification',
          location: prop.location || 'N/A',
          price: 'Verification Service',
          image: '/api/placeholder/300/200',
          status: prop.status,
          created_at: prop.created_at
        }));
      }

      // Process investment data
      if (investmentResponse.data) {
        newCategoryData.investment = investmentResponse.data.map(prop => ({
          id: prop.id,
          title: prop.title || 'Investment',
          location: prop.location || 'N/A',
          price: prop.price ? `₦${prop.price.toLocaleString()}` : 'Investment',
          image: '/api/placeholder/300/200',
          status: prop.status,
          created_at: prop.created_at
        }));
      }


      setCategoryData(newCategoryData);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleCategoryData = async (category: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let response;
      let mappedData: PropertyCard[] = [];

      switch (category) {
        case 'contacts':
          // Fetch contacts (profiles)
          response = await supabase
            .from('profiles')
            .select('*')
            .limit(100);
          if (response.data) {
            mappedData = response.data.map(profile => ({
              id: profile.id,
              title: profile.first_name + ' ' + (profile.last_name || ''),
              location: 'N/A',
              price: 'Contact',
              image: '/api/placeholder/300/200',
              status: 'active',
              created_at: profile.created_at
            }));
          }
          break;
        case 'verifications':
          response = await supabase
            .from('properties')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'verifications')
            .limit(100);
          if (response.data) {
            mappedData = response.data.map(prop => ({
              id: prop.id,
              title: prop.title || 'Verification',
              location: prop.location || 'N/A',
              price: 'Verification Service',
              image: '/api/placeholder/300/200',
              status: prop.status,
              created_at: prop.created_at
            }));
          }
          break;
        case 'investment':
          response = await supabase
            .from('properties')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'investment')
            .limit(100);
          if (response.data) {
            mappedData = response.data.map(prop => ({
              id: prop.id,
              title: prop.title || 'Investment',
              location: prop.location || 'N/A',
              price: prop.price ? `₦${prop.price.toLocaleString()}` : 'Investment',
              image: '/api/placeholder/300/200',
              status: prop.status,
              created_at: prop.created_at
            }));
          }
          break;
      }

      setCategoryData({ [category]: mappedData });
    } catch (error) {
      console.error('Error fetching single category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPropertiesByCategory = (properties: PropertyCard[], category: 'recent' | 'completed' | 'ongoing') => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (category) {
      case 'recent':
        return properties.filter(prop => new Date(prop.created_at) >= sevenDaysAgo);
      case 'completed':
        return properties.filter(prop => prop.status === 'Completed' || prop.status === 'completed');
      case 'ongoing':
        return properties.filter(prop => prop.status === 'Active' || prop.status === 'Available' || prop.status === 'active' || prop.status === 'available');
      default:
        return properties;
    }
  };

  const getPaginatedItems = (items: PropertyCard[], page: number, itemsPerPage: number = 6) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items: PropertyCard[], itemsPerPage: number = 6) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Remove loading screen for instant loading
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, always visible on desktop */}
      <div className="fixed inset-y-0 left-0 w-20 bg-white shadow-lg hidden md:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-indigo-600">
            <div className="text-white text-xs font-bold">M</div>
          </div>
          <nav className="flex-1 px-2 py-6">
            <div className="flex flex-col items-center space-y-4">
              {navigationItems.map((item, index) => (
                <div key={item.id} className="flex flex-col items-center">
                  <div className="relative group">
                    <button
                      onClick={() => handleSidebarAction(index)}
                      className={`w-14 h-14 flex items-center justify-center rounded-lg border transition-colors ${
                        item.active ? 'bg-orange-500 text-white border-orange-600' : 'bg-blue-500 text-white border-blue-600 hover:bg-orange-500'
                      }`}
                      title={item.label}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="w-8 h-8 object-cover rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/32/32';
                        }}
                      />
                    </button>
                    {/* Hover tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  </div>
                  {index < navigationItems.length - 1 && (
                    <div className="my-2">
                      <div className="w-8 h-px bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-3 overflow-x-auto">
          {navigationItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleSidebarAction(index)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-shrink-0 ${
                item.active ? 'bg-orange-500 text-white' : 'bg-white text-blue-500 hover:bg-orange-500'
              }`}
              title={item.label}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="w-8 h-8 object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/api/placeholder/32/32';
                }}
              />
              <span className={`text-[10px] mt-1 leading-tight ${item.active ? 'text-white' : 'text-gray-600'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-20 pb-20 md:pb-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Smart Dashboard</h2>
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Notifications */}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="relative p-2 hover:bg-gray-100"
                >
                  <Link href="/notifications">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                      3
                    </Badge>
                  </Link>
                </Button>
                <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Welcome back, {user?.first_name || 'User'}!
                </div>
                <div className="text-xs text-gray-600 sm:hidden">
                  Hi, {user?.first_name || 'User'}!
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-2 sm:p-3 md:p-4 lg:p-6">
          {/* Navigation Buttons Grid */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 mb-6 sm:mb-8">
            {/* Top row - 2 buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {dashboardButtons.slice(0, 2).map((button, index) => (
                <button
                  key={button.id}
                  onClick={() => handleButtonClick(button.id)}
                  className={`relative rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 border border-gray-200 hover:border-gray-300 group w-full shadow-md overflow-hidden ${
                    (activeStatus === button.id || activeSingleCategory === button.id) ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(to bottom, #3b82f6 50%, #ffffff 50%)'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4 overflow-hidden bg-white shadow-sm">
                      <img
                        src={button.icon}
                        alt={button.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                        }}
                      />
                    </div>
                    <h4 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mb-1 sm:mb-2 leading-tight">
                      {button.label}
                    </h4>
                    <div className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
                      {button.count} items
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {/* Bottom row - 2 buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {dashboardButtons.slice(2, 4).map((button, index) => (
                <button
                  key={button.id}
                  onClick={() => handleButtonClick(button.id)}
                  className={`relative rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 border border-gray-200 hover:border-gray-300 group w-full shadow-md overflow-hidden ${
                    (activeStatus === button.id || activeSingleCategory === button.id) ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(to bottom, #3b82f6 50%, #ffffff 50%)'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4 overflow-hidden bg-white shadow-sm">
                      <img
                        src={button.icon}
                        alt={button.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                        }}
                      />
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 leading-tight">{button.label}</h3>
                    <div className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
                      {button.count} items
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Listing View - Always shown under buttons */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Status/Category Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 capitalize">
                  {activeStatus ? `${activeStatus} Activities` : activeSingleCategory ? `${activeSingleCategory.charAt(0).toUpperCase() + activeSingleCategory.slice(1)}` : 'Completed Activities'}
                </h3>
                {(activeStatus || activeSingleCategory) && (
                  <button
                    onClick={() => {
                      setActiveStatus('completed');
                      setActiveSingleCategory(null);
                      setActiveCategory('poll');
                      setCurrentPage(1);
                      fetchCategoryData('completed');
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Back to Completed
                  </button>
                )}
              </div>
            </div>

            {/* Category Tabs - Only show for multi-category views */}
            {activeStatus && (
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex-1 min-w-0 px-2 sm:px-3 md:px-4 py-3 sm:py-4 text-center font-medium transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 ${
                        activeCategory === category.id
                          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Content */}
            <div className="p-3 sm:p-4 md:p-6">
              {(() => {
                const currentCategory = activeStatus ? activeCategory : activeSingleCategory || 'poll';
                const currentItems = categoryData[currentCategory] || [];
                const paginatedItems = getPaginatedItems(currentItems, currentPage);
                const totalPages = getTotalPages(currentItems);

                return (
                  <div>
                    {/* Items Grid/List */}
                    {(currentCategory === 'verifications') ? (
                      // List view for verifications and consultations
                      <div className="space-y-3">
                        {paginatedItems.map(item => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-indigo-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                                <p className="text-xs text-gray-600">{item.location}</p>
                                <p className="text-xs text-gray-500 mt-1">{item.price}</p>
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(item.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Grid view for listings (poll, marketplace, prospect, investment, contacts, consultations)
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {paginatedItems.map(item => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-indigo-300 transition-colors">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg mb-2 sm:mb-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                              }}
                            />
                            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">{item.title}</h4>
                            <p className="text-xs text-gray-600 mb-1 line-clamp-1">{item.location}</p>
                            {currentCategory !== 'poll' && (
                              <p className="text-xs sm:text-sm font-medium text-green-600">{item.price}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center mt-6 space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          if (pageNum > totalPages) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 text-sm border rounded ${
                                currentPage === pageNum
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    )}

                    {/* Empty state */}
                    {currentItems.length === 0 && (
                      <div className="text-center py-6 sm:py-8">
                        <p className="text-xs sm:text-sm text-gray-500">
                          No {activeStatus || activeSingleCategory} items found
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
