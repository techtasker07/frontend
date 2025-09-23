import { supabase } from './supabase'
import type { DetailedProspect, PropertyValuation } from './advanced-ai-valuator'

export interface SavedProspectAnalysis {
  id: string
  user_id: string
  property_image_url?: string
  property_data: {
    propertySize: number
    stories?: number
    rooms: number
    averageRoomSize?: number
    amenities: string[]
    currentUsage: string
    location: string
    useCoordinates: boolean
  }
  valuation: PropertyValuation
  prospects: DetailedProspect[]
  identified_category?: {
    name: string
    confidence: number
  }
  created_at: string
  updated_at: string
  is_favorite: boolean
  notes?: string
  status: 'draft' | 'analyzing' | 'completed' | 'archived'
}

export interface ProspectComparison {
  id: string
  user_id: string
  name: string
  prospect_ids: string[]
  created_at: string
  notes?: string
}

class ProspectManager {
  private client = supabase

  // Save prospect analysis to dashboard
  async saveProspectAnalysis(
    propertyData: any,
    valuation: PropertyValuation,
    prospects: DetailedProspect[],
    identifiedCategory?: { name: string; confidence: number },
    propertyImageUrl?: string
  ): Promise<SavedProspectAnalysis | null> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const analysisData = {
        user_id: user.id,
        property_image_url: propertyImageUrl,
        property_data: propertyData,
        valuation,
        prospects,
        identified_category: identifiedCategory,
        is_favorite: false,
        status: 'completed' as const
      }

      const { data, error } = await this.client
        .from('prospect_analyses')
        .insert(analysisData)
        .select()
        .single()

      if (error) {
        console.error('Error saving prospect analysis:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error saving prospect analysis:', error)
      return null
    }
  }

  // Get all saved analyses for current user
  async getSavedAnalyses(): Promise<SavedProspectAnalysis[]> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return []
      }

      const { data, error } = await this.client
        .from('prospect_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved analyses:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching saved analyses:', error)
      return []
    }
  }

  // Get a specific analysis by ID
  async getAnalysisById(id: string): Promise<SavedProspectAnalysis | null> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return null
      }

      const { data, error } = await this.client
        .from('prospect_analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching analysis:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching analysis:', error)
      return null
    }
  }

  // Update analysis (e.g., add to favorites, add notes)
  async updateAnalysis(id: string, updates: Partial<SavedProspectAnalysis>): Promise<boolean> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return false
      }

      const { error } = await this.client
        .from('prospect_analyses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating analysis:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating analysis:', error)
      return false
    }
  }

  // Delete analysis
  async deleteAnalysis(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return false
      }

      const { error } = await this.client
        .from('prospect_analyses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting analysis:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting analysis:', error)
      return false
    }
  }

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const analysis = await this.getAnalysisById(id)
      if (!analysis) return false

      return await this.updateAnalysis(id, {
        is_favorite: !analysis.is_favorite
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return false
    }
  }

  // Add notes to analysis
  async addNotes(id: string, notes: string): Promise<boolean> {
    return await this.updateAnalysis(id, { notes })
  }

  // Get favorite analyses
  async getFavoriteAnalyses(): Promise<SavedProspectAnalysis[]> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return []
      }

      const { data, error } = await this.client
        .from('prospect_analyses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching favorite analyses:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching favorite analyses:', error)
      return []
    }
  }

  // Create prospect comparison
  async createComparison(
    name: string, 
    prospectIds: string[], 
    notes?: string
  ): Promise<ProspectComparison | null> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return null
      }

      const { data, error } = await this.client
        .from('prospect_comparisons')
        .insert({
          user_id: user.id,
          name,
          prospect_ids: prospectIds,
          notes
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating comparison:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating comparison:', error)
      return null
    }
  }

  // Get all comparisons for user
  async getComparisons(): Promise<ProspectComparison[]> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return []
      }

      const { data, error } = await this.client
        .from('prospect_comparisons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching comparisons:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching comparisons:', error)
      return []
    }
  }

  // Export analysis data
  async exportAnalysis(id: string): Promise<Blob | null> {
    try {
      const analysis = await this.getAnalysisById(id)
      if (!analysis) return null

      const exportData = {
        ...analysis,
        exported_at: new Date().toISOString(),
        export_version: '1.0'
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      return new Blob([jsonString], { type: 'application/json' })
    } catch (error) {
      console.error('Error exporting analysis:', error)
      return null
    }
  }

  // Share analysis (generate shareable link)
  async generateShareableLink(id: string): Promise<string | null> {
    try {
      const analysis = await this.getAnalysisById(id)
      if (!analysis) return null

      // Create a public sharing record
      const { data, error } = await this.client
        .from('shared_analyses')
        .insert({
          analysis_id: id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating shareable link:', error)
        return null
      }

      return `${window.location.origin}/shared/analysis/${data.share_token}`
    } catch (error) {
      console.error('Error generating shareable link:', error)
      return null
    }
  }

  // Archive old analyses (keep database clean)
  async archiveOldAnalyses(daysOld: number = 90): Promise<boolean> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return false
      }

      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await this.client
        .from('prospect_analyses')
        .update({ status: 'archived' })
        .eq('user_id', user.id)
        .lt('created_at', cutoffDate)
        .neq('is_favorite', true) // Don't archive favorites

      if (error) {
        console.error('Error archiving analyses:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error archiving analyses:', error)
      return false
    }
  }

  // Get analytics/statistics
  async getAnalytics(): Promise<{
    totalAnalyses: number
    favoritesCount: number
    averageROI: number
    topCategories: { category: string; count: number }[]
    monthlyActivity: { month: string; count: number }[]
  }> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      
      if (!user) {
        return {
          totalAnalyses: 0,
          favoritesCount: 0,
          averageROI: 0,
          topCategories: [],
          monthlyActivity: []
        }
      }

      const analyses = await this.getSavedAnalyses()
      
      const totalAnalyses = analyses.length
      const favoritesCount = analyses.filter(a => a.is_favorite).length
      
      // Calculate average ROI across all prospects
      let totalROI = 0
      let prospectCount = 0
      
      analyses.forEach(analysis => {
        analysis.prospects.forEach(prospect => {
          totalROI += prospect.expectedROI
          prospectCount++
        })
      })
      
      const averageROI = prospectCount > 0 ? totalROI / prospectCount : 0

      // Top categories
      const categoryCount: Record<string, number> = {}
      analyses.forEach(analysis => {
        if (analysis.identified_category) {
          const category = analysis.identified_category.name
          categoryCount[category] = (categoryCount[category] || 0) + 1
        }
      })

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Monthly activity (last 6 months)
      const monthlyActivity = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        const count = analyses.filter(analysis => {
          const analysisDate = new Date(analysis.created_at)
          const analysisMonth = `${analysisDate.getFullYear()}-${String(analysisDate.getMonth() + 1).padStart(2, '0')}`
          return analysisMonth === monthKey
        }).length

        monthlyActivity.push({
          month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          count
        })
      }

      return {
        totalAnalyses,
        favoritesCount,
        averageROI,
        topCategories,
        monthlyActivity
      }
    } catch (error) {
      console.error('Error getting analytics:', error)
      return {
        totalAnalyses: 0,
        favoritesCount: 0,
        averageROI: 0,
        topCategories: [],
        monthlyActivity: []
      }
    }
  }
}

// Singleton instance
export const prospectManager = new ProspectManager()

// Helper functions for localStorage fallback (when offline)
export const localStorageManager = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`prospect_${key}`, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  },

  load: (key: string) => {
    try {
      const data = localStorage.getItem(`prospect_${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return null
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(`prospect_${key}`)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  },

  // Cache analysis temporarily during navigation
  cacheCurrentAnalysis: (data: {
    propertyData: any
    valuation: PropertyValuation
    prospects: DetailedProspect[]
    identifiedCategory?: { name: string; confidence: number }
    propertyImageUrl?: string
  }) => {
    return localStorageManager.save('current_analysis', {
      ...data,
      cached_at: new Date().toISOString()
    })
  },

  getCachedAnalysis: () => {
    const cached = localStorageManager.load('current_analysis')
    if (!cached) return null

    // Check if cache is less than 1 hour old
    const cacheAge = Date.now() - new Date(cached.cached_at).getTime()
    if (cacheAge > 60 * 60 * 1000) { // 1 hour
      localStorageManager.remove('current_analysis')
      return null
    }

    return cached
  },

  clearCache: () => {
    localStorageManager.remove('current_analysis')
  }
}
