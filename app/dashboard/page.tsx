'use client';

import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { MarketplacePropertiesUpdate } from '@/components/dashboard/MarketplacePropertiesUpdate';
import Link from 'next/link';

// Define interfaces for our data structures
interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

interface StatItem {
  id: string;
  label: string;
  value: string;
  trend: string;
  icon: string;
  color: string;
}

interface PollItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  details: string;
  progress: number;
  votes: number;
  timeLeft: string;
  status: string;
  statusColor: string;
}


interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
  color: string;
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

  const [statItems, setStatItems] = useState<StatItem[]>([]);
  const [pollItems, setPollItems] = useState<PollItem[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
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

  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await supabaseApi.getDashboardStats();
      if (statsResponse.success) {
        const stats = statsResponse.data;
        setStatItems([
          {
            id: 'active-polls',
            label: 'Active Polls',
            value: stats.activePolls.toString(),
            trend: '+3 this week',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            color: 'indigo'
          },
          {
            id: 'community-votes',
            label: 'Community Votes',
            value: stats.communityVotes.toString(),
            trend: '+18 today',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            color: 'purple'
          },
          {
            id: 'marketplace-properties',
            label: 'Marketplace Properties',
            value: (stats as any).marketplaceProperties?.toString() || '0',
            trend: '+5 new this week',
            icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
            color: 'green'
          }
        ]);
      }

      // Fetch dashboard polls
      const pollsResponse = await supabaseApi.getDashboardPolls(10);
      if (pollsResponse.success) {
        setPollItems(pollsResponse.data);
      }


      // Fetch dashboard activities
      const activitiesResponse = await supabaseApi.getDashboardActivities(10);
      if (activitiesResponse.success) {
        setActivityItems(activitiesResponse.data);
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

  const handleCreatePoll = () => {
    alert('Create New Property Poll modal would open here with form fields for property details, images, and poll questions.');
  };

  const handleSearch = (query: string) => {
    alert(`Searching for properties: "${query}"`);
  };

  const handlePollClick = (pollId: string) => {
    alert(`Property poll details and voting interface would open for poll: ${pollId}`);
  };


  const handleViewAll = () => {
    alert('Full list view would open here with filtering and sorting options.');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
      <div className="md:ml-16 pb-20 md:pb-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Smart Dashboard</h2>
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="relative hidden sm:block">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    className="w-48 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleCreatePoll}
                  className="bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
                >
                  <span className="hidden sm:inline">Create New Poll</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-4 md:p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {statItems.map(stat => (
              <div key={stat.id} className="bg-white rounded-xl p-6 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm text-${stat.color}-600`}>{stat.trend}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Polls */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Active Property Polls</h3>
                  <button
                    onClick={handleViewAll}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {pollItems.map(poll => (
                    <div
                      key={poll.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                      onClick={() => handlePollClick(poll.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={poll.image}
                          alt={poll.title}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{poll.title}</h4>
                          <p className="text-sm text-gray-600">{poll.price} • {poll.details}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="poll-progress h-2 rounded-full bg-indigo-600"
                                  style={{ width: `${poll.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{poll.progress}% positive</span>
                            </div>
                            <span className="text-sm text-gray-500">{poll.votes} votes</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">{poll.timeLeft}</span>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${poll.statusColor}-100 text-${poll.statusColor}-800`}>
                              {poll.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Marketplace Properties Update */}
            <div>
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Marketplace Properties</h3>
                  <Link href="/marketplace" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View All
                  </Link>
                </div>
                <MarketplacePropertiesUpdate />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
