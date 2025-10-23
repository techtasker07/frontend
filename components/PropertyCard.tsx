import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Image from "next/image";
import { Heart, MapPin, Bed, Bath, Square, TrendingUp, Users } from "lucide-react";
import { supabaseApi, Property, PropertyStats } from "../lib/supabase-api";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const [pollStats, setPollStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPollStats = async () => {
      try {
        setLoading(true);
        // Fetch poll stats
        const statsResponse = await supabaseApi.getPropertyStats(property.id);
        if (statsResponse.success) {
          setPollStats(statsResponse.data);
        }
      } catch (err) {
        setError('Failed to load poll stats');
      } finally {
        setLoading(false);
      }
    };

    fetchPollStats();
  }, [property.id]);

  const handleViewDetails = () => {
    if (isMarketProperty) {
      router.push(`/marketplace/${property.id}`);
    } else {
      router.push(`/properties/${property.id}`);
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !property) {
    return (
      <Card className="overflow-hidden">
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Failed to load property</span>
        </div>
        <CardContent className="p-4">
          <div className="text-red-500 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];
  const imageUrl = primaryImage?.image_url || '/api/placeholder/300/200';
  const price = property.current_worth ? `₦${property.current_worth.toLocaleString()}` : 'Price on request';
  const type = property.type || 'sale';
  const isMarketProperty = type === 'sale' || type === 'rent' || type === 'booking' || type === 'lease';
  const isHot = pollStats && pollStats.total_votes > 50; // Example logic for hot properties
  const pollVotes = pollStats?.total_votes || 0;
  const pollPercentage = property.pollPercentage || pollStats?.statistics?.[0]?.percentage || 0;

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      case 'booking': return 'For Booking';
      case 'poll': return 'Community Poll';
      default: return 'Community Poll';
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="default" className="bg-white text-gray-900">
            {getTypeLabel(type)}
          </Badge>
          {isHot && (
            <Badge className="bg-red-500 text-white">
              <TrendingUp className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          )}
        </div>

        {/* Poll Indicator */}
        {!isMarketProperty && pollVotes > 0 && (
          <div className="absolute bottom-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Users className="w-3 h-3" />
            {pollVotes} votes
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-1">{property.title}</h3>

        <div className="flex items-center text-gray-500 text-sm">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="text-sm font-bold text-primary">{price}</div>

        {/* Poll Results */}
        {!isMarketProperty && pollPercentage > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Top Votes</span>
              <span>{pollPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${pollPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="w-full" onClick={handleViewDetails}>View Details</Button>
          {!isMarketProperty && <Button variant="outline" size="sm">Poll</Button>}
        </div>
      </div>
    </div>
  );
}