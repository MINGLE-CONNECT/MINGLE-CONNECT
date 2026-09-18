'use client'

import { useEffect } from 'react'
import { createClient } from '../../lib/supabase'

export default function PresenceTracker() {
  useEffect(() => {
    const supabase = createClient()

    async function updatePresence() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase
        .from('profiles')
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    updatePresence()

    const interval = setInterval(updatePresence, 30000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updatePresence()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      )
    }
  }, [])

  return null
}
