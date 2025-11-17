import { create } from 'zustand';
import { supabaseApi, Property, MarketplaceListing } from '../supabase-api';

// Combined property type for both poll and marketplace properties
export type CombinedProperty = Property & {
  source?: 'poll' | 'marketplace';
  listing_type?: { name: string };
  property_type?: { name: string };
};

interface HomeState {
  properties: CombinedProperty[];
  filteredProperties: CombinedProperty[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  viewMode: 'grid' | 'list';
  displayLimit: number;
  searchFilters: {
    location: string;
    propertyType: string;
    priceRange: string;
  };
  showSearchSection: boolean;
  activeTab: string;
  scrollPosition: number;
  lastViewedPropertyId: string | null;

  // Actions
  fetchProperties: () => Promise<void>;
  setFilteredProperties: (properties: CombinedProperty[]) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setDisplayLimit: (limit: number) => void;
  setSearchFilters: (filters: Partial<HomeState['searchFilters']>) => void;
  applyFilters: () => void;
  setShowSearchSection: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  setScrollPosition: (position: number) => void;
  setLastViewedPropertyId: (id: string | null) => void;
  resetState: () => void;
  forceRefresh: () => Promise<void>;
  saveStateToStorage: () => void;
  loadStateFromStorage: () => void;
}

const initialState = {
  properties: [],
  filteredProperties: [],
  isLoading: false,
  error: null,
  lastFetchTime: null,
  viewMode: 'grid' as const,
  displayLimit: 6,
  searchFilters: {
    location: '',
    propertyType: '',
    priceRange: ''
  },
  showSearchSection: false,
  activeTab: 'all',
  scrollPosition: 0,
  lastViewedPropertyId: null
};

export const useHomeStore = create<HomeState>((set, get) => ({
  ...initialState,

  fetchProperties: async () => {
    const state = get();
    // Only fetch if not already loading and no recent fetch (within 5 minutes)
    if (state.isLoading || (state.lastFetchTime && Date.now() - state.lastFetchTime < 300000)) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log('🔄 Fetching properties for home page...');

      // Fetch poll properties
      const pollResponse = await supabaseApi.getProperties({ limit: 15, source: 'poll' });
      console.log('📊 Poll response:', pollResponse);

      let marketplaceResponse;
      try {
        marketplaceResponse = await supabaseApi.getMarketplaceListings({ limit: 15 });
        console.log('🏪 Marketplace response:', marketplaceResponse);
      } catch (error) {
        console.error('❌ Marketplace fetch error:', error);
        marketplaceResponse = { success: false, data: [], error: 'Marketplace not available' };
      }

      let allProperties: CombinedProperty[] = [];

      // Add poll properties
      if (pollResponse.success) {
        const pollProperties = pollResponse.data.map(prop => ({
          ...prop,
          source: 'poll' as const,
          current_worth: prop.current_worth || 0
        }));
        allProperties = [...allProperties, ...pollProperties];
      }

      // Add marketplace properties
      if (marketplaceResponse.success && marketplaceResponse.data.length > 0) {
        const marketplaceProperties = marketplaceResponse.data.map((listing: MarketplaceListing): CombinedProperty => ({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          location: listing.location,
          user_id: listing.user_id,
          category_id: listing.category_id,
          current_worth: listing.price,
          year_of_construction: listing.year_of_construction,
          image_url: listing.images?.[0]?.image_url,
          created_at: listing.created_at,
          updated_at: listing.updated_at,
          category_name: listing.category?.name,
          images: listing.images?.map(img => ({
            id: img.id,
            property_id: listing.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            created_at: listing.created_at
          })) || [],
          source: 'marketplace' as const,
          type: listing.listing_type?.name?.toLowerCase().replace('for ', '') || 'sale',
          listing_type: listing.listing_type,
          property_type: listing.property_type,
          vote_count: 0
        }));
        allProperties = [...allProperties, ...marketplaceProperties];
      }

      // Sort by creation date (most recent first)
      const sortedProperties = allProperties.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('✅ Properties fetched successfully:', sortedProperties.length, 'items');

      set({
        properties: sortedProperties,
        filteredProperties: sortedProperties,
        isLoading: false,
        lastFetchTime: Date.now()
      });
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch properties',
        isLoading: false
      });
    }
  },

  setFilteredProperties: (properties) => set({ filteredProperties: properties }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setDisplayLimit: (limit) => set({ displayLimit: limit }),

  setSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters }
  })),

  applyFilters: () => {
    const state = get();
    if (!state.properties) return;

    let filtered = state.properties;

    if (state.searchFilters.location) {
      filtered = filtered.filter(p =>
        p.location?.toLowerCase().includes(state.searchFilters.location.toLowerCase())
      );
    }

    if (state.searchFilters.propertyType) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(state.searchFilters.propertyType.toLowerCase()) ||
        p.description?.toLowerCase().includes(state.searchFilters.propertyType.toLowerCase())
      );
    }

    if (state.searchFilters.priceRange) {
      let min = 0, max = Infinity;
      switch (state.searchFilters.priceRange) {
        case '0-50m': max = 50000000; break;
        case '50m-100m': min = 50000000; max = 100000000; break;
        case '100m-200m': min = 100000000; max = 200000000; break;
        case '200m-500m': min = 200000000; max = 500000000; break;
        case '500m-1b': min = 500000000; max = 1000000000; break;
        case '1b+': min = 1000000000; break;
      }
      filtered = filtered.filter(p => {
        const price = p.current_worth || 0;
        return price >= min && price <= max;
      });
    }

    set({ filteredProperties: filtered });
  },

  setShowSearchSection: (show) => set({ showSearchSection: show }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setScrollPosition: (position) => set({ scrollPosition: position }),

  setLastViewedPropertyId: (id) => set({ lastViewedPropertyId: id }),

  resetState: () => set(initialState),

  forceRefresh: async () => {
    set({ lastFetchTime: null });
    await get().fetchProperties();
  },

  saveStateToStorage: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    const stateToSave = {
      viewMode: state.viewMode,
      displayLimit: state.displayLimit,
      searchFilters: state.searchFilters,
      showSearchSection: state.showSearchSection,
      activeTab: state.activeTab,
      scrollPosition: state.scrollPosition,
      lastViewedPropertyId: state.lastViewedPropertyId
    };
    localStorage.setItem('home-page-state', JSON.stringify(stateToSave));
  },

  loadStateFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedState = localStorage.getItem('home-page-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        set({
          viewMode: parsed.viewMode || 'grid',
          displayLimit: parsed.displayLimit || 6,
          searchFilters: parsed.searchFilters || initialState.searchFilters,
          showSearchSection: parsed.showSearchSection || false,
          activeTab: parsed.activeTab || 'all',
          scrollPosition: parsed.scrollPosition || 0,
          lastViewedPropertyId: parsed.lastViewedPropertyId || null
        });
      }
    } catch (error) {
      console.error('Error loading home page state from storage:', error);
    }
  }
}));