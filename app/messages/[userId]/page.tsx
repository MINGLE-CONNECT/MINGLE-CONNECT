'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  message: string
  created_at: string
}

export default function DirectChat() {
  const params = useParams()
  const userId = String(params.userId)

  const [uid, setUid] = useState('')
  const [name, setName] = useState('Mingle member')
  const [photo, setPhoto] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChat()
  }, [userId])

  async function loadChat() {
    const c = createClient()

    const {
      data: { user }
    } = await c.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setUid(user.id)

    const { data: profile } = await c
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle()

    setName(profile?.display_name || 'Mingle member')

    const { data: photos } = await c
      .from('profile_photos')
      .select('storage_path')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .limit(1)

    if (photos?.[0]?.storage_path) {
      const { data } = c.storage
        .from('profile-photos')
        .getPublicUrl(photos[0].storage_path)

      setPhoto(data.publicUrl)
    }

    await loadMessages(user.id)

    setLoading(false)
  }

  async function loadMessages(currentUserId = uid) {
    if (!currentUserId) return

    const c = createClient()

    const { data: sent } = await c
      .from('direct_messages')
      .select('id,sender_id,recipient_id,message,created_at')
      .eq('sender_id', currentUserId)
      .eq('recipient_id', userId)

    const { data: received } = await c
      .from('direct_messages')
      .select('id,sender_id,recipient_id,message,created_at')
      .eq('sender_id', userId)
      .eq('recipient_id', currentUserId)

    const combined = [
      ...(sent || []),
      ...(received || [])
    ].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    )

    setMessages(combined)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages])

  async function sendMessage() {
    const text = body.trim()

    if (!text || sending || !uid) return

    setSending(true)

    const c = createClient()

    const { data, error } = await c
      .from('direct_messages')
      .insert({
        sender_id: uid,
        recipient_id: userId,
        message: text
      })
      .select()
      .single()

    if (error) {
      alert(
        'You need an active Boost to start a new conversation. 🚀'
      )
    } else if (data) {
      setMessages(prev => [...prev, data])
      setBody('')
    }

    setSending(false)
  }

  if (loading) {
    return (
      <main className="direct-chat-page">
        <div className="direct-chat-loading">
          Opening your conversation... 💕
        </div>
      </main>
    )
  }

  return (
    <main className="direct-chat-page">

      <header className="direct-chat-header">

        <Link
          href="/messages"
          className="direct-chat-back"
        >
          ←
        </Link>

        <Link
  href={`/view-profile/${userId}`}
  className="direct-chat-person"
>
  <div className="direct-chat-avatar">
    {photo ? (
      <img
        src={photo}
        alt={name}
      />
    ) : (
      <span>👤</span>
    )}
  </div>

  <div>
    <strong>{name}</strong>
    <small>
      Private conversation
    </small>
  </div>
</Link>

        <span className="direct-chat-heart">
          ❤️
        </span>

      </header>

      <section className="direct-chat-messages">

        {messages.length === 0 && (

          <div className="direct-chat-empty">

            <div className="direct-chat-empty-icon">
              💕
            </div>

            <h2>
              Say hello to {name}
            </h2>

            <p>
              Start a beautiful conversation.
            </p>

          </div>

        )}

        {messages.map(msg => (

          <div
            key={msg.id}
            className={
              msg.sender_id === uid
                ? 'direct-bubble mine'
                : 'direct-bubble theirs'
            }
          >

            <span>
              {msg.message}
            </span>

            <small>
              {new Date(
                msg.created_at
              ).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </small>

          </div>

        ))}

        <div ref={endRef} />

      </section>

      <div className="direct-chat-composer">

        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              sendMessage()
            }
          }}
          maxLength={2000}
          placeholder="Write a sweet message..."
        />

        <button
          onClick={sendMessage}
          disabled={
            sending ||
            !body.trim()
          }
        >
          {sending ? '...' : '➤'}
        </button>

      </div>

    </main>
  )
}
