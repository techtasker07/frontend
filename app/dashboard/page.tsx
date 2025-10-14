'use client';

import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: false },
    { id: 'dashboard', label: 'Dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', active: true },
    { id: 'marketplace', label: 'Marketplace', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', active: false },
    { id: 'properties', label: 'Properties', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', active: false },
    { id: 'add-property', label: 'Add Property', icon: 'M12 4v16m8-8H4', active: false },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', active: false }
  ]);

  const [dashboardButtons, setDashboardButtons] = useState<DashboardButton[]>([
    { id: 'poll', label: 'Poll', icon: '/images/poll.gif', count: 0, route: '/properties', color: 'gray' },
    { id: 'marketplace', label: 'Market Place', icon: '/images/market_place.gif', count: 0, route: '/marketplace', color: 'gray' },
    { id: 'prospects', label: 'Prospects', icon: '/images/prospects.gif', count: 0, route: '/prospects', color: 'gray' },
    { id: 'verifications', label: 'Verifications', icon: '/images/verifications.gif', count: 0, route: '/verifications', color: 'gray' },
    { id: 'investment', label: 'Investment', icon: '/images/investment.gif', count: 0, route: '/investment', color: 'gray' },
    { id: 'consultations', label: 'Consultations', icon: '/images/consultation.gif', count: 0, route: '/consultations', color: 'gray' }
  ]);

  const [activeTab, setActiveTab] = useState<'poll' | 'marketplace'>('poll');
  const [activeSubTab, setActiveSubTab] = useState<'recent' | 'completed' | 'ongoing'>('recent');
  const [pollProperties, setPollProperties] = useState<PropertyCard[]>([]);
  const [marketplaceProperties, setMarketplaceProperties] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Remove loading delay - initialize immediately when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      initializeDashboard();
    }
  }, [isAuthenticated, authLoading]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Fetch counts for dashboard buttons
      const [pollResponse, marketplaceResponse, prospectsResponse] = await Promise.all([
        supabaseApi.getProperties({ source: 'poll', limit: 100 }),
        supabaseApi.getMarketplaceListings({ limit: 100 }),
        supabaseApi.getUserPropertyAnalyses(100)
      ]);

      const pollCount = pollResponse.success ? pollResponse.data.length : 0;
      const marketplaceCount = marketplaceResponse.success ? marketplaceResponse.data.length : 0;
      const prospectsCount = prospectsResponse.success ? prospectsResponse.data.length : 0;

      setDashboardButtons(prev => prev.map(btn => {
        switch (btn.id) {
          case 'poll': return { ...btn, count: pollCount };
          case 'marketplace': return { ...btn, count: marketplaceCount };
          case 'prospects': return { ...btn, count: prospectsCount };
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
      'dashboard': '/dashboard',
      'marketplace': '/marketplace',
      'properties': '/properties',
      'add-property': '/add-property',
      'profile': '/profile'
    };

    // Navigate to the appropriate route
    const route = routes[navItem.id as keyof typeof routes];
    if (route && navItem.id !== 'dashboard') {
      router.push(route);
    }
  };

  const handleButtonClick = (route: string) => {
    router.push(route);
  };

  const getPropertiesByCategory = (properties: PropertyCard[], category: 'recent' | 'completed' | 'ongoing') => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (category) {
      case 'recent':
        return properties.filter(prop => new Date(prop.created_at) >= sevenDaysAgo);
      case 'completed':
        return properties.filter(prop => prop.status === 'Completed');
      case 'ongoing':
        return properties.filter(prop => prop.status === 'Active' || prop.status === 'Available');
      default:
        return properties;
    }
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
      <div className="fixed inset-y-0 left-0 w-16 bg-white shadow-lg hidden md:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-indigo-600">
            <div className="text-white text-xs font-bold">M</div>
          </div>
          <nav className="flex-1 px-2 py-6">
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleSidebarAction(index)}
                    className={`w-full flex items-center justify-center px-2 py-3 rounded-lg transition-colors ${
                      item.active ? 'bg-indigo-50 text-indigo-700 sidebar-active' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={item.label}
                  >
                    <svg className={`w-5 h-5 ${item.active ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                  </button>
                  {/* Hover tooltip */}
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          {navigationItems.slice(0, 5).map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleSidebarAction(index)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                item.active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className={`w-5 h-5 ${item.active ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span className="text-xs mt-1 truncate max-w-[60px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-16 pb-16 sm:pb-20 md:pb-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Smart Dashboard</h2>
              <div className="flex items-center space-x-2 md:space-x-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {dashboardButtons.map(button => (
              <button
                key={button.id}
                onClick={() => handleButtonClick(button.route)}
                className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 group w-full"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4 overflow-hidden">
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

          {/* Properties Tabs */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('poll')}
                  className={`flex-1 min-w-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center font-medium transition-colors text-xs sm:text-sm md:text-base ${
                    activeTab === 'poll'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Poll Properties
                </button>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex-1 min-w-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center font-medium transition-colors text-xs sm:text-sm md:text-base ${
                    activeTab === 'marketplace'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Marketplace Properties
                </button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex overflow-x-auto px-2 sm:px-4 md:px-6">
                {(['recent', 'completed', 'ongoing'] as const).map(subTab => (
                  <button
                    key={subTab}
                    onClick={() => setActiveSubTab(subTab)}
                    className={`flex-1 min-w-0 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-center font-medium transition-colors text-xs sm:text-sm ${
                      activeSubTab === subTab
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {subTab.charAt(0).toUpperCase() + subTab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-3 sm:p-4 md:p-6">
              {activeTab === 'poll' && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {getPropertiesByCategory(pollProperties, activeSubTab).map(property => (
                      <div key={property.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-indigo-300 transition-colors">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg mb-2 sm:mb-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                          }}
                        />
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">{property.title}</h4>
                        <p className="text-xs text-gray-600 mb-1 sm:mb-2 line-clamp-1">{property.location}</p>
                        <p className="text-xs sm:text-sm font-medium text-indigo-600">{property.price}</p>
                      </div>
                    ))}
                  </div>
                  {getPropertiesByCategory(pollProperties, activeSubTab).length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-xs sm:text-sm text-gray-500">No {activeSubTab} poll properties found</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'marketplace' && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {getPropertiesByCategory(marketplaceProperties, activeSubTab).map(property => (
                      <div key={property.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-indigo-300 transition-colors">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg mb-2 sm:mb-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                          }}
                        />
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">{property.title}</h4>
                        <p className="text-xs text-gray-600 mb-1 sm:mb-2 line-clamp-1">{property.location}</p>
                        <p className="text-xs sm:text-sm font-medium text-green-600">{property.price}</p>
                      </div>
                    ))}
                  </div>
                  {getPropertiesByCategory(marketplaceProperties, activeSubTab).length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-xs sm:text-sm text-gray-500">No {activeSubTab} marketplace properties found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
