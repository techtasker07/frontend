// API configuration and utilities
// Removed API_BASE_URL as all calls will now be relative to the Next.js app's origin

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  firebase_uid: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  user_id: number;
  category_id: number;
  current_worth?: number;
  year_of_construction?: number;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  category_name?: string;
  vote_count?: number;
  images?: PropertyImage[];
  vote_options?: VoteOption[];
}

export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Vote {
  id: number;
  user_id: number;
  property_id: number;
  vote_option_id: number;
  created_at: string;
  voter_name?: string;
  property_title?: string;
  vote_option_name?: string;
}

export interface VoteOption {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface VoteStatistics {
  option_name: string;
  vote_option_id: number;
  vote_count: number;
  percentage: number;
}

export interface PropertyStats {
  statistics: VoteStatistics[];
  total_votes: number;
}

export interface ProspectProperty {
  id: number;
  title: string;
  description: string;
  location: string;
  category_id: number;
  estimated_worth?: number;
  year_of_construction?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  ai_analysis?: AIAnalysis; // Only available on detail page for logged-in users
}

export interface AIAnalysis {
  overall_sentiment: string;
  confidence_score: number;
  key_insights: string[];
  strategic_recommendations: string[];
  risk_factors: string;
  estimated_roi: string;
  last_analyzed: string;
}

class ApiClient {
  // Base URL is no longer needed as API routes are relative
  // private baseURL: string;

  constructor() {
    // this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 'Origin': typeof window !== 'undefined' ? window.location.origin : '', // Origin header is handled by browser automatically for same-origin requests
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Construct URL without a base URL, making it relative to the current origin
    const url = `/api${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        // mode: 'cors', // Not needed for same-origin requests, can cause issues
        credentials: 'omit', // No longer need 'include' as session management is internal
        headers: this.getAuthHeaders(),
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json(); // Attempt to parse JSON error
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      // Re-throw the error for the calling component to handle
      throw error;
    }
  }

  // Auth methods
  async register(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/me');
  }

  // Users methods
  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Properties methods
  async getProperties(params?: {
    category?: string;
    user_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Property[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    return this.request(`/properties${queryString ? `?${queryString}` : ''}`);
  }

  async getProperty(id: number): Promise<ApiResponse<Property>> {
    return this.request(`/properties/${id}`);
  }

  async createProperty(propertyData: {
    title: string;
    description: string;
    location: string;
    category_id: number;
    current_worth?: number;
    year_of_construction?: number;
  }): Promise<ApiResponse<Property>> {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updateProperty(id: number, propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id: number): Promise<ApiResponse<Property>> {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Prospect Properties methods
  async getProspectProperties(params?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<ProspectProperty[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/prospect-properties${queryString ? `?${queryString}` : ''}`);
  }

  async getProspectProperty(id: number): Promise<ApiResponse<ProspectProperty>> {
    return this.request(`/prospect-properties/${id}`);
  }

  async createProspectProperty(prospectData: {
    title: string;
    description: string;
    location: string;
    category_id: number;
    estimated_worth?: number;
    year_of_construction?: number;
    image_url?: string;
  }): Promise<ApiResponse<ProspectProperty>> {
    return this.request('/prospect-properties', {
      method: 'POST',
      body: JSON.stringify(prospectData),
    });
  }

  // Categories methods
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/categories');
  }

  // Votes methods
  async getVotes(): Promise<ApiResponse<Vote[]>> {
    return this.request('/votes');
  }

  async getVotesByProperty(propertyId: number): Promise<ApiResponse<Vote[]>> {
    return this.request(`/votes/property/${propertyId}`);
  }

  async createVote(voteData: {
    property_id: number;
    vote_option_id: number;
  }): Promise<ApiResponse<Vote>> {
    return this.request('/votes', {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  }

  // Vote options methods
  async getVoteOptions(): Promise<ApiResponse<VoteOption[]>> {
    return this.request('/vote-options');
  }

  async getVoteOptionsByCategory(categoryId: number): Promise<ApiResponse<VoteOption[]>> {
    return this.request(`/vote-options/category/${categoryId}`);
  }

  // Statistics methods
  async getPropertyStats(propertyId: number): Promise<ApiResponse<PropertyStats>> {
    return this.request(`/properties/${propertyId}/stats`);
  }

  async getPlatformStats(): Promise<ApiResponse<{
    total_users: number;
    total_properties: number;
    total_votes: number;
    total_images: number;
    recent_activity: any[];
    total_prospect_properties: number; // Added missing prop
  }>> {
    return this.request('/stats');
  }
}

export const api = new ApiClient();
