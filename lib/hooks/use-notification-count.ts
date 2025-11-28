import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('read', false)

        if (error) {
          console.error('Error fetching notification count:', error)
          return
        }

        setUnreadCount(count || 0)
      } catch (error) {
        console.error('Error fetching notification count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('notification-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, isAuthenticated])

  return { unreadCount, loading }
}