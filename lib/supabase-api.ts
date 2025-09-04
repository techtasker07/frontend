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
        vote_options: voteOptionsByCategory[item.category_id] || []
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
}

export const supabaseApi = new SupabaseApiClient();
