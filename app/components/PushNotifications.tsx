
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export default function PushNotifications() {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()

      setVisible(!!data.session?.user)
    }

    checkUser()

    const supabase = createClient()
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setVisible(!!session?.user)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  async function enableNotifications() {
    try {
      setLoading(true)
      setMessage('')

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setMessage('Push notifications are not supported by this browser.')
        return
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!publicKey) {
        setMessage('Notification setup is not complete yet.')
        return
      }

      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        setMessage('Please allow notifications in your browser settings.')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')

      const subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

      const supabase = createClient()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        setMessage('Please log in again.')
        return
      }

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      })

      if (!response.ok) {
        throw new Error('Could not save notification settings.')
      }

      setMessage('Message notifications enabled successfully!')
    } catch (error) {
      console.error(error)
      setMessage('Could not enable notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <div style={{ padding: '12px', textAlign: 'center' }}>
      <button
        onClick={enableNotifications}
        disabled={loading}
        style={{
          background: '#e83e8c',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Enabling...' : 'Enable Message Notifications'}
      </button>

      {message && (
        <p style={{ fontSize: '13px', marginTop: '8px' }}>
          {message}
        </p>
      )}
    </div>
  )
}
