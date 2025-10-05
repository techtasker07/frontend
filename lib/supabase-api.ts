import { supabase } from './supabase';
import { supabaseServer } from './db';

// Updated interfaces for Supabase (using string IDs)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  user_id: string;
  category_id: string;
  current_worth?: number;
  year_of_construction?: number;
  lister_phone_number?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  owner_profile_picture?: string;
  category_name?: string;
  vote_count?: number;
  images?: PropertyImage[];
  vote_options?: VoteOption[];
  type?: string;
  pollPercentage?: number;
}


export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  property_id: string;
  vote_option_id: string;
  created_at: string;
  voter_name?: string;
  property_title?: string;
  vote_option_name?: string;
}

export interface VoteOption {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface VoteStatistics {
  option_name: string;
  vote_option_id: string;
  vote_count: number;
  percentage: number;
}

export interface PropertyStats {
  statistics: VoteStatistics[];
  total_votes: number;
}

// Marketplace interfaces - Independent structure
export interface MarketplaceListing {
  id: string;
  // Basic Property Information
  title: string;
  description: string;
  location: string;
  // Property Type and Category
  listing_type_id: string;
  property_type_id: string;
  category_id: string;
  // Pricing Information
  price: number;
  currency: string;
  price_period?: string;
  security_deposit?: number;
  // Property Details
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  area_sqm?: number;
  year_of_construction?: number;
  furnishing_status?: string;
  parking_spaces: number;
  // Availability
  available_from?: string;
  available_to?: string;
  // Features and Amenities
  amenities: string[];
  utilities_included: boolean;
  // Listing Management
  is_featured: boolean;
  is_active: boolean;
  views_count: number;
  // Contact Information
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  // User who created the listing
  user_id: string;
  // SEO and Additional Info
  keywords?: string[];
  virtual_tour_url?: string;
  video_url?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
  // Relations (populated by joins)
  listing_type?: { name: string };
  property_type?: { name: string };
  category?: { name: string };
  images?: MarketplaceImage[];

  // General Property Details
  property_condition?: string;
  city?: string;
  state?: string;
  country?: string;

  // Residential specific fields
  toilets?: number;
  kitchen_size?: string;
  dining_room?: boolean;
  balcony_terrace?: boolean;
  pet_friendly?: boolean;
  appliances_included?: string[];
  security_features?: string[];
  neighbourhood_features?: string[];

  // Commercial specific fields
  property_usage_type?: string;
  total_floors?: number;
  floor_number?: number;
  office_rooms?: number;
  conference_rooms?: number;
  internet_available?: boolean;
  power_supply?: string;
  loading_dock?: boolean;
  storage_space?: string;
  accessibility_features?: string[];
  fire_safety_features?: string[];

  // Land specific fields
  land_type?: string;
  title_document?: string;
  topography?: string;
  water_access?: boolean;
  electricity_access?: boolean;
  fence_boundary_status?: string;
  road_access?: boolean;
  soil_type?: string;
  proximity_to_amenities?: string[];

  // Function-specific fields
  payment_frequency?: string;
  minimum_rental_period?: string;
  lease_duration?: string;
  renewal_terms?: string;

  // Booking-specific fields
  daily_rate?: number;
  weekly_rate?: number;
  hourly_rate?: number; // For commercial bookings
  check_in_time?: string;
  check_out_time?: string;
  minimum_stay_duration?: number;
  maximum_stay_duration?: number;
  minimum_booking_duration?: number; // For commercial bookings
  maximum_booking_duration?: number; // For commercial bookings
  cancellation_policy?: string;
  caution_fee?: number;
  services_included?: string[];

  // Missing general fields
  property_size?: string; // Alternative/additional to area_sqft/area_sqm

  // Additional Residential fields
  monthly_rent_amount?: number; // For rent function

  // Additional Commercial fields - missing ones
  parking_capacity?: number; // Different from parking_spaces

  // Additional Lease-specific fields
  lease_amount?: number;
}

export interface MarketplaceImage {
  id: string;
  marketplace_listing_id: string;
  image_url: string;
  is_primary: boolean;
  caption?: string;
  display_order: number;
  created_at: string;
}

export interface PropertyType {
  id: string;
  name: string;
  category_id: string;
  category?: { name: string };
}

export interface ListingType {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  marketplace_listing_id: string;
  user_id: string;
  booking_type: string;
  start_date?: string;
  end_date?: string;
  guest_count?: number;
  message?: string;
  status: string;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  marketplace_listing_id: string;
  created_at: string;
}

interface GetPropertiesParams {
  category?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
  source?: 'poll' | 'marketplace' | 'both';
}

interface GetMarketplaceListingsParams {
  category?: string;
  listing_type?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
}

class SupabaseApiClient {
  // Users methods
  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as User
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as User,
        error: error.message
      };
    }
  }

  // Properties methods
  async getProperties(params?: GetPropertiesParams): Promise<ApiResponse<Property[]>> {
    try {
      const sourceFilter = params?.source || 'both';
      let allProperties: Property[] = [];

      // Only fetch poll properties if source is 'poll' or 'both'
      if (sourceFilter === 'poll' || sourceFilter === 'both') {
        let pollQuery = supabase
          .from('properties')
          .select(`
            *,
            profiles!properties_user_id_fkey (
              first_name,
              last_name,
              email,
              phone_number,
              profile_picture
            ),
            categories!properties_category_id_fkey (
              name
            ),
            property_images (
              id,
              image_url,
              is_primary
            )
          `);

        if (params?.category) {
          pollQuery = pollQuery.eq('categories.name', params.category);
        }
        if (params?.user_id) {
          pollQuery = pollQuery.eq('user_id', params.user_id);
        }

        const { data: pollData, error: pollError } = await pollQuery;
        if (pollError) throw pollError;

        // Get vote options for poll properties
        const pollCategoryIds = [...new Set(pollData?.map(item => item.category_id) || [])];
        let allVoteOptions: VoteOption[] = [];
        if (pollCategoryIds.length > 0) {
          const { data: voteOptionsData } = await supabase
            .from('vote_options')
            .select('*')
            .in('category_id', pollCategoryIds);
          allVoteOptions = voteOptionsData || [];
        }

        const voteOptionsByCategory = allVoteOptions.reduce((acc, option) => {
          if (!acc[option.category_id]) acc[option.category_id] = [];
          acc[option.category_id].push(option);
          return acc;
        }, {} as { [key: string]: VoteOption[] });

        const transformedPollProperties = pollData?.map(item => ({
          ...item,
          owner_name: `${item.profiles?.first_name} ${item.profiles?.last_name}`,
          owner_email: item.profiles?.email,
          owner_phone: item.profiles?.phone_number,
          owner_profile_picture: item.profiles?.profile_picture,
          category_name: item.categories?.name,
          images: item.property_images || [],
          vote_options: voteOptionsByCategory[item.category_id] || [],
          type: item.type || 'poll',
          pollPercentage: item.pollPercentage || 0
        })) || [];

        allProperties.push(...transformedPollProperties);
      }

      // Only fetch marketplace listings if source is 'marketplace' or 'both'
      if (sourceFilter === 'marketplace' || sourceFilter === 'both') {
        let marketplaceQuery = supabase
          .from('marketplace_listings')
          .select(`
            *,
            listing_type:listing_types!marketplace_listings_listing_type_id_fkey (
              name
            ),
            property_type:property_types!marketplace_listings_property_type_id_fkey (
              name
            ),
            category:categories!marketplace_listings_category_id_fkey (
              name
            ),
            profiles!marketplace_listings_user_id_fkey (
              first_name,
              last_name,
              email,
              phone_number,
              profile_picture
            ),
            marketplace_images (
              id,
              image_url,
              is_primary
            )
          `)
          .eq('is_active', true);

        if (params?.category) {
          marketplaceQuery = marketplaceQuery.eq('category.name', params.category);
        }
        if (params?.user_id) {
          marketplaceQuery = marketplaceQuery.eq('user_id', params.user_id);
        }

        const { data: marketplaceData, error: marketplaceError } = await marketplaceQuery;
        if (marketplaceError) throw marketplaceError;

        const typeMapping: { [key: string]: string } = {
          'For Sale': 'sale',
          'For Rent': 'rent',
          'For Lease': 'lease',
          'For Booking': 'booking'
        };

        const transformedMarketplaceProperties = marketplaceData?.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          location: item.location,
          user_id: item.user_id,
          category_id: item.category_id,
          current_worth: item.price,
          year_of_construction: item.year_of_construction,
          lister_phone_number: item.contact_phone,
          image_url: item.marketplace_images?.find((img: any) => img.is_primary)?.image_url,
          created_at: item.created_at,
          updated_at: item.updated_at,
          owner_name: `${item.profiles?.first_name} ${item.profiles?.last_name}`,
          owner_email: item.profiles?.email,
          owner_phone: item.profiles?.phone_number,
          owner_profile_picture: item.profiles?.profile_picture,
          category_name: item.category?.name,
          vote_count: 0,
          images: item.marketplace_images?.map((img: any) => ({
            id: img.id,
            property_id: item.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            created_at: img.created_at || item.created_at
          })) || [],
          vote_options: [],
          type: typeMapping[item.listing_type?.name] || 'sale',
          pollPercentage: 0
        })) || [];

        allProperties.push(...transformedMarketplaceProperties);
      }

      // Sort by creation date
      allProperties.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply limit and offset
      let finalProperties = allProperties;
      if (params?.offset) {
        finalProperties = finalProperties.slice(params.offset);
      }
      if (params?.limit) {
        finalProperties = finalProperties.slice(0, params.limit);
      }

      return {
        success: true,
        data: finalProperties,
        count: allProperties.length
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getProperty(id: string): Promise<ApiResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles!properties_user_id_fkey (
            first_name,
            last_name,
            email,
            phone_number,
            profile_picture
          ),
          categories!properties_category_id_fkey (
            name
          ),
          property_images (
            id,
            image_url,
            is_primary
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch vote options for this property's category
      const { data: voteOptionsData, error: voteOptionsError } = await supabase
        .from('vote_options')
        .select('*')
        .eq('category_id', data.category_id);

      if (voteOptionsError) {
        console.error('Error fetching vote options:', voteOptionsError);
      }

      const transformedData = {
        ...data,
        owner_name: `${data.profiles?.first_name} ${data.profiles?.last_name}`,
        owner_email: data.profiles?.email,
        owner_phone: data.profiles?.phone_number,
        owner_profile_picture: data.profiles?.profile_picture,
        category_name: data.categories?.name,
        images: data.property_images || [],
        vote_options: voteOptionsData || []
      };

      return {
        success: true,
        data: transformedData as Property
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Property,
        error: error.message
      };
    }
  }

  async createProperty(propertyData: {
    title: string;
    description: string;
    location: string;
    category_id: string;
    type?: string;
    current_worth?: number;
    year_of_construction?: number;
    lister_phone_number?: string;
    image_urls?: string[];
  }): Promise<ApiResponse<Property>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // If image URLs provided, insert them
      if (propertyData.image_urls && propertyData.image_urls.length > 0) {
        const imageInserts = propertyData.image_urls.map((url, index) => ({
          property_id: data.id,
          image_url: url,
          is_primary: index === 0
        }));

        await supabase
          .from('property_images')
          .insert(imageInserts);
      }

      return {
        success: true,
        data: data as Property
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Property,
        error: error.message
      };
    }
  }

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Property
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Property,
        error: error.message
      };
    }
  }

  async deleteProperty(id: string): Promise<ApiResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Property
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Property,
        error: error.message
      };
    }
  }

  // Categories methods
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) throw error;

      return {
        success: true,
        data: data as Category[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Votes methods
  async getVotes(): Promise<ApiResponse<Vote[]>> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          profiles!votes_user_id_fkey (
            first_name,
            last_name
          ),
          properties!votes_property_id_fkey (
            title
          ),
          vote_options!votes_vote_option_id_fkey (
            name
          )
        `);

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        voter_name: `${item.profiles?.first_name} ${item.profiles?.last_name}`,
        property_title: item.properties?.title,
        vote_option_name: item.vote_options?.name
      })) || [];

      return {
        success: true,
        data: transformedData as Vote[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async createVote(voteData: {
    property_id: string;
    vote_option_id: string;
  }): Promise<ApiResponse<Vote>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already voted for this property
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', voteData.property_id)
        .single();

      if (existingVote) {
        throw new Error('User has already voted for this property');
      }

      const { data, error } = await supabase
        .from('votes')
        .insert({
          ...voteData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Vote
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Vote,
        error: error.message
      };
    }
  }

  // Vote options methods
  async getVoteOptions(): Promise<ApiResponse<VoteOption[]>> {
    try {
      const { data, error } = await supabase
        .from('vote_options')
        .select(`
          *,
          categories!vote_options_category_id_fkey (
            name
          )
        `);

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        category_name: item.categories?.name
      })) || [];

      return {
        success: true,
        data: transformedData as VoteOption[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getVoteOptionsByCategory(categoryId: string): Promise<ApiResponse<VoteOption[]>> {
    try {
      const { data, error } = await supabase
        .from('vote_options')
        .select('*')
        .eq('category_id', categoryId);

      if (error) throw error;

      return {
        success: true,
        data: data as VoteOption[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }


  async getPropertiesByBudget(budget: number): Promise<ApiResponse<Property[]>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles!properties_user_id_fkey (
            first_name,
            last_name,
            email,
            phone_number,
            profile_picture
          ),
          categories!properties_category_id_fkey (
            name
          ),
          property_images (
            id,
            image_url,
            is_primary
          )
        `)
        .lte('current_worth', budget);

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        owner_name: `${item.profiles?.first_name} ${item.profiles?.last_name}`,
        owner_email: item.profiles?.email,
        owner_phone: item.profiles?.phone_number,
        owner_profile_picture: item.profiles?.profile_picture,
        category_name: item.categories?.name,
        images: item.property_images || []
      })) || [];

      return {
        success: true,
        data: transformedData as Property[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getVotesByProperty(propertyId: string): Promise<ApiResponse<Vote[]>> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          profiles!votes_user_id_fkey (
            first_name,
            last_name
          ),
          vote_options!votes_vote_option_id_fkey (
            name
          )
        `)
        .eq('property_id', propertyId);

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        voter_name: `${item.profiles?.first_name} ${item.profiles?.last_name}`,
        vote_option_name: item.vote_options?.name
      })) || [];

      return {
        success: true,
        data: transformedData as Vote[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getPropertyStats(propertyId: string): Promise<ApiResponse<PropertyStats>> {
    try {
      // Get all votes for this property with vote options
      const { data: votes, error } = await supabase
        .from('votes')
        .select(`
          *,
          vote_options!votes_vote_option_id_fkey (
            id,
            name
          )
        `)
        .eq('property_id', propertyId);

      if (error) throw error;

      // Calculate statistics
      const voteStats: { [key: string]: { count: number, option_name: string, vote_option_id: string } } = {};
      let totalVotes = 0;

      votes?.forEach(vote => {
        const optionId = vote.vote_option_id;
        const optionName = vote.vote_options?.name || 'Unknown';
        
        if (!voteStats[optionId]) {
          voteStats[optionId] = {
            count: 0,
            option_name: optionName,
            vote_option_id: optionId
          };
        }
        voteStats[optionId].count++;
        totalVotes++;
      });

      const statistics: VoteStatistics[] = Object.values(voteStats).map(stat => ({
        option_name: stat.option_name,
        vote_option_id: stat.vote_option_id,
        vote_count: stat.count,
        percentage: totalVotes > 0 ? Math.round((stat.count / totalVotes) * 100) : 0
      }));

      return {
        success: true,
        data: {
          statistics,
          total_votes: totalVotes
        }
      };
    } catch (error: any) {
      return {
        success: false,
        data: { statistics: [], total_votes: 0 },
        error: error.message
      };
    }
  }

  async getPlatformStats(): Promise<ApiResponse<{
    total_users: number;
    total_properties: number;
    total_votes: number;
    total_images: number;
    recent_activity: any[];
  }>> {
    try {
      // Get counts from each table
      const [usersResult, propertiesResult, votesResult, imagesResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('property_images').select('id', { count: 'exact', head: true })
      ]);

      // Get recent activity (last 10 properties created)
      const { data: recentProperties, error: recentError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          created_at,
          profiles!properties_user_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      const recent_activity = recentProperties?.map((prop: any) => ({
        type: 'property_created',
        title: prop.title,
        user_name: `${prop.profiles?.first_name} ${prop.profiles?.last_name}`,
        created_at: prop.created_at
      })) || [];

      return {
        success: true,
        data: {
          total_users: usersResult.count || 0,
          total_properties: propertiesResult.count || 0,
          total_votes: votesResult.count || 0,
          total_images: imagesResult.count || 0,
          recent_activity
        }
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          total_users: 0,
          total_properties: 0,
          total_votes: 0,
          total_images: 0,
          recent_activity: []
        },
        error: error.message
      };
    }
  }

  // Dashboard-specific methods
  async getDashboardStats(): Promise<ApiResponse<{
    activePolls: number;
    communityVotes: number;
    portfolioValue: number;
  }>> {
    try {
      const [propertiesResult, votesResult] = await Promise.all([
        supabase.from('properties').select('current_worth', { count: 'exact' }),
        supabase.from('votes').select('id', { count: 'exact', head: true })
      ]);

      // Calculate total portfolio value
      const portfolioValue = propertiesResult.data?.reduce((sum, prop) => {
        return sum + (prop.current_worth || 0);
      }, 0) || 0;

      return {
        success: true,
        data: {
          activePolls: propertiesResult.count || 0,
          communityVotes: votesResult.count || 0,
          portfolioValue
        }
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          activePolls: 0,
          communityVotes: 0,
          portfolioValue: 0
        },
        error: error.message
      };
    }
  }

  async getDashboardPolls(limit: number = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          current_worth,
          location,
          created_at,
          property_images!left (
            image_url,
            is_primary
          ),
          votes!left (
            id,
            vote_options (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform data to match expected format
      const transformedData = data?.map((property, index) => {
        const voteCount = property.votes?.length || 0;
        const primaryImage = property.property_images?.find((img: any) => img.is_primary);
        const imageUrl = primaryImage?.image_url || '/api/placeholder/300/200';
        
        // Calculate mock progress and time left for demonstration
        const progress = Math.floor(Math.random() * 100);
        const timeLeft = `${Math.floor(Math.random() * 30) + 1} days left`;
        const statusOptions = ['Active', 'Ending Soon', 'New'];
        const statusColors = ['green', 'orange', 'blue'];
        const statusIndex = index % statusOptions.length;
        
        return {
          id: property.id,
          title: property.title,
          description: property.description,
          image: imageUrl,
          price: property.current_worth ? `₦${property.current_worth.toLocaleString()}` : 'Price on request',
          details: property.location,
          progress,
          votes: voteCount,
          timeLeft,
          status: statusOptions[statusIndex],
          statusColor: statusColors[statusIndex]
        };
      }) || [];

      return {
        success: true,
        data: transformedData
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }


  async getDashboardActivities(limit: number = 10): Promise<ApiResponse<any[]>> {
    try {
      // Get recent votes and properties as activities
      const [votesResponse, propertiesResponse] = await Promise.all([
        supabase
          .from('votes')
          .select(`
            id,
            created_at,
            profiles!votes_user_id_fkey (
              first_name,
              last_name
            ),
            properties!votes_property_id_fkey (
              title
            ),
            vote_options!votes_vote_option_id_fkey (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit / 2),
        supabase
          .from('properties')
          .select(`
            id,
            title,
            created_at,
            profiles!properties_user_id_fkey (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit / 2)
      ]);

      const activities: any[] = [];

      // Add vote activities
      votesResponse.data?.forEach((vote: any) => {
        const profile = vote.profiles;
        const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
        activities.push({
          id: `vote-${vote.id}`,
          type: 'vote',
          message: `${userName} voted "${vote.vote_options?.name}" on ${vote.properties?.title}`,
          time: this.getRelativeTime(vote.created_at),
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          color: 'green'
        });
      });

      // Add property activities
      propertiesResponse.data?.forEach((property: any) => {
        const profile = property.profiles;
        const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
        activities.push({
          id: `property-${property.id}`,
          type: 'property',
          message: `${userName} added a new property: ${property.title}`,
          time: this.getRelativeTime(property.created_at),
          icon: 'M12 4v16m8-8H4',
          color: 'blue'
        });
      });

      // Sort activities by creation time and limit
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return {
        success: true,
        data: activities.slice(0, limit)
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  private getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }

  // Upload method (using Supabase Storage)
  async uploadFile(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return {
        success: true,
        data: { url: publicUrl }
      };
    } catch (error: any) {
      return {
        success: false,
        data: { url: '' },
        error: error.message
      };
    }
  }

  // Hero images methods
  async getActiveHeroImage(): Promise<ApiResponse<{ image_url: string; alt_text?: string }>> {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('image_url, alt_text')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as { image_url: string; alt_text?: string }
      };
    } catch (error: any) {
      return {
        success: false,
        data: { image_url: '', alt_text: '' },
        error: error.message
      };
    }
  }

  async getAllHeroImages(): Promise<ApiResponse<{ id: string; image_url: string; alt_text?: string; is_active: boolean }[]>> {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('id, image_url, alt_text, is_active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as { id: string; image_url: string; alt_text?: string; is_active: boolean }[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Marketplace methods - Independent structure
  async getMarketplaceListings(params?: GetMarketplaceListingsParams): Promise<ApiResponse<MarketplaceListing[]>> {
    try {
      console.log('🔍 Fetching marketplace listings with params:', params);
      
      // Start with the most basic query possible
      let query = supabase
        .from('marketplace_listings')
        .select('*');

      // Only filter by is_active if explicitly requested
      // Since RLS is disabled, let's try without this filter first
      // query = query.eq('is_active', true);

      // Apply basic filters
      if (params?.min_price) {
        query = query.gte('price', params.min_price);
      }
      if (params?.max_price) {
        query = query.lte('price', params.max_price);
      }
      if (params?.location) {
        query = query.ilike('location', `%${params.location}%`);
      }
      if (params?.bedrooms) {
        query = query.gte('bedrooms', params.bedrooms);
      }
      if (params?.bathrooms) {
        query = query.gte('bathrooms', params.bathrooms);
      }
      if (params?.is_featured !== undefined) {
        query = query.eq('is_featured', params.is_featured);
      }
      if (params?.limit) {
        query = query.limit(params.limit);
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      query = query.order('created_at', { ascending: false });

      console.log('📊 Executing basic marketplace query...');
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Marketplace query error:', error);
        // If marketplace_listings table doesn't exist, return empty array
        if (error.message?.includes('relation "marketplace_listings" does not exist')) {
          console.warn('⚠️ Marketplace listings table does not exist, returning empty array');
          return {
            success: true,
            data: []
          };
        }
        throw error;
      }

      console.log('✅ Raw marketplace data fetched:', data?.length || 0, 'records');
      
      // If we got basic data, try to enrich it with related data
      if (data && data.length > 0) {
        try {
          // Try to get related data separately
          const enrichedData = await Promise.all(data.map(async (listing: any) => {
            try {
              // Try to get listing type
              let listingType = null;
              if (listing.listing_type_id) {
                const { data: ltData } = await supabase
                  .from('listing_types')
                  .select('name')
                  .eq('id', listing.listing_type_id)
                  .single();
                listingType = ltData;
              }

              // If listing type is not found, infer from price_period
              if (!listingType) {
                if (!listing.price_period) {
                  listingType = { name: 'For Sale' };
                } else if (listing.price_period === 'monthly') {
                  listingType = { name: 'For Rent' };
                } else {
                  listingType = { name: 'For Lease' };
                }
              }

              // Try to get property type
              let propertyType = null;
              if (listing.property_type_id) {
                const { data: ptData } = await supabase
                  .from('property_types')
                  .select('name')
                  .eq('id', listing.property_type_id)
                  .single();
                propertyType = ptData;
              }

              // If property type is not found, provide a default
              if (!propertyType) {
                propertyType = { name: 'Property' };
              }

              // Try to get category
              let category = null;
              if (listing.category_id) {
                const { data: catData } = await supabase
                  .from('categories')
                  .select('name')
                  .eq('id', listing.category_id)
                  .single();
                category = catData;
              }

              // Try to get images
              const { data: imagesData } = await supabase
                .from('marketplace_images')
                .select('id, image_url, is_primary, caption, display_order')
                .eq('marketplace_listing_id', listing.id)
                .order('display_order');

              return {
                ...listing,
                listing_type: listingType,
                property_type: propertyType,
                category: category,
                images: imagesData || []
              };
            } catch (enrichError) {
              console.warn('⚠️ Failed to enrich listing data:', enrichError);
              // Return listing with fallback values
              return {
                ...listing,
                listing_type: listing.price_period ? { name: 'For Rent' } : { name: 'For Sale' },
                property_type: { name: 'Property' },
                category: null,
                images: []
              };
            }
          }));

          console.log('✅ Marketplace data enriched successfully');
          return {
            success: true,
            data: enrichedData as MarketplaceListing[]
          };
        } catch (enrichError) {
          console.warn('⚠️ Failed to enrich data, returning basic data:', enrichError);
          return {
            success: true,
            data: data as MarketplaceListing[]
          };
        }
      }

      return {
        success: true,
        data: data as MarketplaceListing[]
      };
    } catch (error: any) {
      console.error('💥 Marketplace listings fetch failed:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getMarketplaceListing(id: string): Promise<ApiResponse<MarketplaceListing>> {
    try {
      // First, get the basic listing data
      const { data: listing, error: listingError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (listingError) throw listingError;

      // Get images
      const { data: images, error: imagesError } = await supabase
        .from('marketplace_images')
        .select('id, image_url, is_primary, caption, display_order')
        .eq('marketplace_listing_id', id)
        .order('display_order');

      if (imagesError) {
        console.warn('Error fetching images:', imagesError);
      }

      // Get category
      let category = null;
      if (listing.category_id) {
        const { data: catData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', listing.category_id)
          .single();
        category = catData;
      }

      // Get listing type - try to fetch, fallback to default
      let listingType = null;
      if (listing.listing_type_id) {
        const { data: ltData } = await supabase
          .from('listing_types')
          .select('name')
          .eq('id', listing.listing_type_id)
          .single();
        listingType = ltData;
      }

      // If listing type is not found, infer from price_period
      if (!listingType) {
        if (!listing.price_period) {
          listingType = { name: 'For Sale' };
        } else if (listing.price_period === 'monthly') {
          listingType = { name: 'For Rent' };
        } else {
          listingType = { name: 'For Lease' };
        }
      }

      // Get property type - try to fetch, fallback to default
      let propertyType = null;
      if (listing.property_type_id) {
        const { data: ptData } = await supabase
          .from('property_types')
          .select('name')
          .eq('id', listing.property_type_id)
          .single();
        propertyType = ptData;
      }

      // If property type is not found, provide a default based on category
      if (!propertyType) {
        const categoryName = category?.name;
        if (categoryName === 'Residential') {
          propertyType = { name: 'Property' };
        } else if (categoryName === 'Commercial') {
          propertyType = { name: 'Commercial Property' };
        } else if (categoryName === 'Land') {
          propertyType = { name: 'Land' };
        } else {
          propertyType = { name: 'Property' };
        }
      }

      // Construct the full listing object
      const fullListing = {
        ...listing,
        listing_type: listingType,
        property_type: propertyType,
        category: category,
        images: images || []
      };

      // Increment view count
      await supabase
        .from('marketplace_listings')
        .update({ views_count: (listing.views_count || 0) + 1 })
        .eq('id', id);

      return {
        success: true,
        data: fullListing as MarketplaceListing
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as MarketplaceListing,
        error: error.message
      };
    }
  }

  async createMarketplaceListing(listingData: {
    title: string;
    description: string;
    location: string;
    listing_type_id: string;
    property_type_id: string;
    category_id: string;
    price: number;
    currency?: string;
    price_period?: string;
    security_deposit?: number;
    bedrooms?: number;
    bathrooms?: number;
    area_sqft?: number;
    area_sqm?: number;
    year_of_construction?: number;
    furnishing_status?: string;
    parking_spaces?: number;
    available_from?: string;
    available_to?: string;
    amenities?: string[];
    utilities_included?: boolean;
    keywords?: string[];
    virtual_tour_url?: string;
    video_url?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_whatsapp?: string;
    // General Property Details
    property_condition?: string;
    city?: string;
    state?: string;
    country?: string;
    // Residential specific fields
    toilets?: number;
    kitchen_size?: string;
    dining_room?: boolean;
    balcony_terrace?: boolean;
    pet_friendly?: boolean;
    appliances_included?: string[];
    security_features?: string[];
    neighbourhood_features?: string[];
    // Commercial specific fields
    property_usage_type?: string;
    total_floors?: number;
    floor_number?: number;
    office_rooms?: number;
    conference_rooms?: number;
    internet_available?: boolean;
    power_supply?: string;
    loading_dock?: boolean;
    storage_space?: string;
    accessibility_features?: string[];
    fire_safety_features?: string[];
    // Land specific fields
    land_type?: string;
    title_document?: string;
    topography?: string;
    water_access?: boolean;
    electricity_access?: boolean;
    fence_boundary_status?: string;
    road_access?: boolean;
    soil_type?: string;
    proximity_to_amenities?: string[];
    // Function-specific fields
    payment_frequency?: string;
    minimum_rental_period?: string;
    lease_duration?: string;
    renewal_terms?: string;
    // Booking-specific fields
    daily_rate?: number;
    weekly_rate?: number;
    hourly_rate?: number;
    check_in_time?: string;
    check_out_time?: string;
    minimum_stay_duration?: number;
    maximum_stay_duration?: number;
    minimum_booking_duration?: number;
    maximum_booking_duration?: number;
    cancellation_policy?: string;
    caution_fee?: number;
    services_included?: string[];
    // Additional fields
    property_size?: string;
    monthly_rent_amount?: number;
    parking_capacity?: number;
    lease_amount?: number;
  }): Promise<ApiResponse<MarketplaceListing>> {
    try {
      console.log('🔍 Getting user...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      console.log('✅ User authenticated:', user.id);

      const insertData = {
        ...listingData,
        user_id: user.id,
        currency: listingData.currency || 'NGN',
        parking_spaces: listingData.parking_spaces || 0,
        amenities: listingData.amenities || [],
        utilities_included: listingData.utilities_included || false,
        keywords: listingData.keywords || [],
        is_featured: false,
        is_active: true,
        views_count: 0
      };

      console.log('📝 Inserting data:', insertData);

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }

      console.log('✅ Listing created:', data);

      return {
        success: true,
        data: data as MarketplaceListing
      };
    } catch (error: any) {
      console.error('💥 Create listing failed:', error);
      return {
        success: false,
        data: {} as MarketplaceListing,
        error: error.message
      };
    }
  }

  async getPropertyTypes(categoryId?: string): Promise<ApiResponse<PropertyType[]>> {
    try {
      let query = supabase
        .from('property_types')
        .select(`
          *,
          category:categories!property_types_category_id_fkey (
            name
          )
        `);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        success: true,
        data: data as PropertyType[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getListingTypes(): Promise<ApiResponse<ListingType[]>> {
    try {
      const { data, error } = await supabase
        .from('listing_types')
        .select('*');

      if (error) throw error;

      return {
        success: true,
        data: data as ListingType[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Bookings methods
  async createBooking(bookingData: {
    marketplace_listing_id: string;
    booking_type: string;
    start_date?: string;
    end_date?: string;
    guest_count?: number;
    message?: string;
    total_amount?: number;
  }): Promise<ApiResponse<Booking>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Booking
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Booking,
        error: error.message
      };
    }
  }

  async getUserBookings(): Promise<ApiResponse<Booking[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          marketplace_listing:marketplace_listings!bookings_marketplace_listing_id_fkey (
            id,
            title,
            location,
            price,
            currency
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Booking[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Favorites methods
  async addToFavorites(marketplaceListingId: string): Promise<ApiResponse<Favorite>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          marketplace_listing_id: marketplaceListingId
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Favorite
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Favorite,
        error: error.message
      };
    }
  }

  async removeFromFavorites(marketplaceListingId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('marketplace_listing_id', marketplaceListingId);

      if (error) throw error;

      return {
        success: true,
        data: true
      };
    } catch (error: any) {
      return {
        success: false,
        data: false,
        error: error.message
      };
    }
  }

  async getUserFavorites(): Promise<ApiResponse<MarketplaceListing[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          marketplace_listing:marketplace_listings!favorites_marketplace_listing_id_fkey (
            *,
            listing_type:listing_types!marketplace_listings_listing_type_id_fkey (
              name
            ),
            property_type:property_types!marketplace_listings_property_type_id_fkey (
              name
            ),
            category:categories!marketplace_listings_category_id_fkey (
              name
            ),
            images:marketplace_images (
              id,
              image_url,
              is_primary,
              caption,
              display_order
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const listings = (data?.map(item => item.marketplace_listing).filter(Boolean) || []) as unknown as MarketplaceListing[];

      return {
        success: true,
        data: listings
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }
}

export const supabaseApi = new SupabaseApiClient();
