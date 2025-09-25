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

export interface ProspectProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  category_id: string;
  estimated_worth?: number;
  year_of_construction?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  prospects?: PropertyProspect[];
}

export interface PropertyProspect {
  id: string;
  prospect_property_id: string;
  title: string;
  description: string;
  estimated_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
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
  async getProperties(params?: {
    category?: string;
    user_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Property[]>> {
    try {
      let query = supabase
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
        query = query.eq('categories.name', params.category);
      }
      if (params?.user_id) {
        query = query.eq('user_id', params.user_id);
      }
      if (params?.limit) {
        query = query.limit(params.limit);
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Get unique category IDs from the properties
      const categoryIds = [...new Set(data?.map(item => item.category_id) || [])];

      // Fetch vote options for all categories
      const { data: allVoteOptions, error: voteOptionsError } = await supabase
        .from('vote_options')
        .select('*')
        .in('category_id', categoryIds);

      if (voteOptionsError) {
        console.error('Error fetching vote options:', voteOptionsError);
      }

      // Group vote options by category_id
      const voteOptionsByCategory: { [key: string]: VoteOption[] } = {};
      allVoteOptions?.forEach(option => {
        if (!voteOptionsByCategory[option.category_id]) {
          voteOptionsByCategory[option.category_id] = [];
        }
        voteOptionsByCategory[option.category_id].push(option);
      });

      // Transform data to match expected format
      const transformedData = data?.map(item => ({
        ...item,
        owner_name: `${item.profiles?.first_name} ${item.profiles?.last_name}`,
        owner_email: item.profiles?.email,
        owner_phone: item.profiles?.phone_number,
        owner_profile_picture: item.profiles?.profile_picture,
        category_name: item.categories?.name,
        images: item.property_images || [],
        vote_options: voteOptionsByCategory[item.category_id] || [],
        type: item.type || 'sale', // Default to 'sale' if not set
        pollPercentage: item.pollPercentage || 0 // Default to 0
      })) || [];

      return {
        success: true,
        data: transformedData as Property[],
        count: count || 0
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

  // Prospect Properties methods
  async getProspectProperties(params?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<ProspectProperty[]>> {
    try {
      let query = supabase
        .from('prospect_properties')
        .select(`
          *,
          categories!prospect_properties_category_id_fkey (
            name
          ),
          property_prospects (
            id,
            title,
            description,
            estimated_cost,
            total_cost
          )
        `);

      if (params?.category) {
        query = query.eq('categories.name', params.category);
      }
      if (params?.limit) {
        query = query.limit(params.limit);
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        category_name: item.categories?.name,
        prospects: item.property_prospects || []
      })) || [];

      return {
        success: true,
        data: transformedData as ProspectProperty[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getProspectProperty(id: string): Promise<ApiResponse<ProspectProperty>> {
    try {
      const { data, error } = await supabase
        .from('prospect_properties')
        .select(`
          *,
          categories!prospect_properties_category_id_fkey (
            name
          ),
          property_prospects (
            id,
            title,
            description,
            estimated_cost,
            total_cost
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        category_name: data.categories?.name,
        prospects: data.property_prospects || []
      };

      return {
        success: true,
        data: transformedData as ProspectProperty
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as ProspectProperty,
        error: error.message
      };
    }
  }

  async createProspectProperty(propertyData: {
    title: string;
    description: string;
    location: string;
    category_id: string;
    estimated_worth?: number;
    year_of_construction?: number;
    image_url?: string;
  }): Promise<ApiResponse<ProspectProperty>> {
    try {
      const { data, error } = await supabase
        .from('prospect_properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProspectProperty
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as ProspectProperty,
        error: error.message
      };
    }
  }

  async updateProspectProperty(id: string, propertyData: Partial<ProspectProperty>): Promise<ApiResponse<ProspectProperty>> {
    try {
      const { data, error } = await supabase
        .from('prospect_properties')
        .update(propertyData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProspectProperty
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as ProspectProperty,
        error: error.message
      };
    }
  }

  async deleteProspectProperty(id: string): Promise<ApiResponse<ProspectProperty>> {
    try {
      const { data, error } = await supabase
        .from('prospect_properties')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as ProspectProperty
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as ProspectProperty,
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
    smartProspects: number;
    communityVotes: number;
    portfolioValue: number;
  }>> {
    try {
      const [propertiesResult, prospectsResult, votesResult] = await Promise.all([
        supabase.from('properties').select('current_worth', { count: 'exact' }),
        supabase.from('prospect_properties').select('id', { count: 'exact', head: true }),
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
          smartProspects: prospectsResult.count || 0,
          communityVotes: votesResult.count || 0,
          portfolioValue
        }
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          activePolls: 0,
          smartProspects: 0,
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

  async getDashboardProspects(limit: number = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('prospect_properties')
        .select(`
          id,
          title,
          location,
          estimated_worth,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform data to match expected format
      const transformedData = data?.map((prospect, index) => {
        const aiScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
        const tagOptions = [
          ['High ROI', 'Prime Location'],
          ['Growing Area', 'Good Value'],
          ['Investment Grade', 'Rental Potential'],
          ['Development Zone', 'Infrastructure']
        ];
        
        return {
          id: prospect.id,
          title: prospect.title,
          location: prospect.location,
          aiScore,
          tags: tagOptions[index % tagOptions.length]
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
  async getMarketplaceListings(params?: {
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
  }): Promise<ApiResponse<MarketplaceListing[]>> {
    try {
      let query = supabase
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
          images:marketplace_images (
            id,
            image_url,
            is_primary,
            caption,
            display_order
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (params?.category) {
        query = query.eq('category.name', params.category);
      }
      if (params?.listing_type) {
        query = query.eq('listing_type.name', params.listing_type);
      }
      if (params?.property_type) {
        query = query.eq('property_type.name', params.property_type);
      }
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

      const { data, error } = await query;
      if (error) throw error;

      return {
        success: true,
        data: data as MarketplaceListing[]
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async getMarketplaceListing(id: string): Promise<ApiResponse<MarketplaceListing>> {
    try {
      const { data, error } = await supabase
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
          images:marketplace_images (
            id,
            image_url,
            is_primary,
            caption,
            display_order
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('marketplace_listings')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id);

      return {
        success: true,
        data: data as MarketplaceListing
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
  }): Promise<ApiResponse<MarketplaceListing>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
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
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as MarketplaceListing
      };
    } catch (error: any) {
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
