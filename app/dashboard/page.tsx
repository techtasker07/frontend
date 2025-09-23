'use client';

import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../../lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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

interface ProspectItem {
  id: string;
  title: string;
  location: string;
  aiScore: number;
  tags: string[];
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
  
  const [navigationItems] = useState<NavigationItem[]>([
    { id: 'create', label: 'Create', icon: 'M12 4v16m8-8H4', active: false },
    { id: 'smart', label: 'Smart', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', active: true },
    { id: 'community', label: 'Community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', active: false },
    { id: 'insights', label: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', active: false }
  ]);

  const [statItems, setStatItems] = useState<StatItem[]>([]);
  const [pollItems, setPollItems] = useState<PollItem[]>([]);
  const [prospectItems, setProspectItems] = useState<ProspectItem[]>([]);
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
            id: 'smart-prospects',
            label: 'Smart Prospects',
            value: stats.smartProspects.toString(),
            trend: '2 high priority',
            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
            color: 'blue'
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
            id: 'portfolio-value',
            label: 'Portfolio Value',
            value: `$${stats.portfolioValue.toLocaleString()}`,
            trend: '+12.5% this month',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
            color: 'green'
          }
        ]);
      }

      // Fetch dashboard polls
      const pollsResponse = await supabaseApi.getDashboardPolls(10);
      if (pollsResponse.success) {
        setPollItems(pollsResponse.data);
      }

      // Fetch dashboard prospects
      const prospectsResponse = await supabaseApi.getDashboardProspects(10);
      if (prospectsResponse.success) {
        setProspectItems(prospectsResponse.data);
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
    // Remove active class from all buttons
    document.querySelectorAll('.fixed .group button').forEach(btn => {
      btn.classList.remove('sidebar-active');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.classList.remove('text-indigo-600');
        svg.classList.add('text-gray-600');
      }
    });

    // Add active class to clicked button
    const button = document.querySelectorAll('.fixed .group button')[index];
    if (button && index < 4) { // Only for main nav items
      button.classList.add('sidebar-active');
      const svg = button.querySelector('svg');
      if (svg) {
        svg.classList.remove('text-gray-600');
        svg.classList.add('text-indigo-600');
      }
    }

    const sidebarActions = [
      'Create new property poll modal would open here.',
      'You are currently viewing the Smart Dashboard.',
      'Community features and discussions would load here.',
      'Property insights and analytics dashboard would appear here.',
      'Notifications panel would open here.',
      'User profile settings would be shown here.'
    ];

    if (sidebarActions[index] && index !== 1) { // Don't show alert for current page
      alert(sidebarActions[index]);
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

  const handleProspectClick = (prospectId: string) => {
    alert(`Smart prospect detailed analysis and recommendation would open for prospect: ${prospectId}`);
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
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-16 bg-white shadow-lg">
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

      {/* Main content */}
      <div className="ml-16">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Smart Dashboard</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleCreatePoll}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create New Poll
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

            {/* Smart Prospects */}
            <div>
              <div className="bg-white rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Smart Prospects</h3>
                  <button
                    onClick={handleViewAll}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {prospectItems.map(prospect => (
                    <div
                      key={prospect.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors cursor-pointer"
                      onClick={() => handleProspectClick(prospect.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{prospect.title}</h4>
                        <div className="ai-score text-white text-xs px-2 py-1 rounded-full bg-green-500">
                          AI: {prospect.aiScore}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{prospect.location}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        {prospect.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {activityItems.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center`}>
                        <svg className={`w-4 h-4 text-${activity.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activity.icon} />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
