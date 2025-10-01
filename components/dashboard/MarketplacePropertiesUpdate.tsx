'use client';

import React, { useState, useEffect } from 'react';
import { supabaseApi, MarketplaceListing } from '../../lib/supabase-api';
import Link from 'next/link';
import Image from 'next/image';

interface MarketplacePropertiesUpdateProps {
  className?: string;
}

export const MarketplacePropertiesUpdate: React.FC<MarketplacePropertiesUpdateProps> = ({ className = "" }) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentListings();
  }, []);

  const fetchRecentListings = async () => {
    try {
      setLoading(true);
      const response = await supabaseApi.getMarketplaceListings({ 
        limit: 5
      });
      
      if (response.success) {
        setListings(response.data);
      } else {
        console.error('Failed to fetch marketplace listings:', response.error);
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const getImageUrl = (listing: MarketplaceListing) => {
    if (listing.images?.length && listing.images.length > 0) {
      const primaryImage = listing.images.find((img: any) => img.is_primary);
      return primaryImage?.image_url || listing.images[0]?.image_url;
    }
    return '/api/placeholder/400/300';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-3">
        {listings.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No recent marketplace updates</p>
          </div>
        ) : (
          listings.map(listing => (
            <div
              key={listing.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors cursor-pointer"
            >
              <Link href={`/marketplace/${listing.id}`}>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(listing)}
                      alt={listing.title || 'Property'}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {listing.title}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {listing.location}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-semibold text-indigo-600">
                        {formatPrice(listing.price || 0)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(listing.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
      
      {listings.length > 0 && (
        <div className="mt-4 text-center">
          <Link 
            href="/marketplace" 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View All Properties →
          </Link>
        </div>
      )}
    </div>
  );
};
