'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Conversation = {
  id: string
  name: string
  photo: string
  lastMessage: string
  time: string
}

export default function Messages() {
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    const c = createClient()

    const {
      data: { user }
    } = await c.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: messages, error } = await c
      .from('direct_messages')
      .select('id, sender_id, recipient_id, message, created_at')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const latestByPerson: Record<string, any> = {}

    for (const msg of messages || []) {
      const otherUser =
        msg.sender_id === user.id
          ? msg.recipient_id
          : msg.sender_id

      if (!latestByPerson[otherUser]) {
        latestByPerson[otherUser] = {
          ...msg,
          otherUser
        }
      }
    }

    const otherIds = Object.keys(latestByPerson)

    if (!otherIds.length) {
      setConversations([])
      setLoading(false)
      return
    }

    const { data: profiles } = await c
      .from('profiles')
      .select('id, display_name')
      .in('id', otherIds)

    const profileMap: Record<string, any> = {}

    for (const profile of profiles || []) {
      profileMap[profile.id] = profile
    }

    const conversationList: Conversation[] =
      await Promise.all(
        otherIds.map(async personId => {
          const msg = latestByPerson[personId]

          const { data: photo } = await c
            .from('profile_photos')
            .select('storage_path')
            .eq('user_id', personId)
            .order('sort_order', { ascending: true })
            .limit(1)
            .maybeSingle()

          let photoUrl = ''

          if (photo?.storage_path) {
            const { data } = c.storage
              .from('profile-photos')
              .getPublicUrl(photo.storage_path)

            photoUrl = data.publicUrl
          }

          return {
            id: personId,
            name:
              profileMap[personId]?.display_name ||
              'Mingle member',
            photo: photoUrl,
            lastMessage: msg.message,
            time: new Date(
              msg.created_at
            ).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        })
      )

    setConversations(conversationList)
    setLoading(false)
  }

  if (loading) {
    return (
      <main className="messages-page">
        <div className="messages-loading">
          Opening your messages... 💕
        </div>
      </main>
    )
  }

  return (
    <main className="messages-page">

      <header className="messages-header">

        <Link
          href="/dashboard"
          className="messages-back"
        >
          ←
        </Link>

        <div>
          <strong>Mingle-Connect</strong>
          <small>Messages</small>
        </div>

        <span>💬</span>

      </header>

      <section className="messages-content">

        <div className="messages-title">

          <div className="messages-title-icon">
            💌
          </div>

          <h1>Your Messages</h1>

          <p>
            Chat privately with people you're connecting with. ❤️
          </p>

        </div>

        {conversations.length === 0 ? (

          <div className="messages-empty">

            <div className="messages-empty-icon">
              💕
            </div>

            <h2>No conversations yet</h2>

            <p>
              When someone messages you, your conversation
              will appear here.
            </p>

            <Link
              href="/discover"
              className="messages-discover-button"
            >
              🔎 Discover People
            </Link>

          </div>

        ) : (

          <div className="conversation-list">

            {conversations.map(conversation => (

              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="conversation-card"
              >

                <div className="conversation-photo">

                  {conversation.photo ? (

                    <img
                      src={conversation.photo}
                      alt={conversation.name}
                    />

                  ) : (

                    <span>👤</span>

                  )}

                </div>

                <div className="conversation-info">

                  <h2>
                    {conversation.name}
                  </h2>

                  <p>
                    {conversation.lastMessage}
                  </p>

                  <small>
                    {conversation.time}
                  </small>

                </div>

                <span className="conversation-arrow">
                  ›
                </span>

              </Link>

            ))}

          </div>

        )}

      </section>

      <nav className="bottom-nav">

        <Link href="/dashboard">
          <span>🏠</span>
          <small>Home</small>
        </Link>

        <Link href="/discover">
          <span>🔎</span>
          <small>Discover</small>
        </Link>

        <Link
          href="/messages"
          className="active"
        >
          <span>💬</span>
          <small>Messages</small>
        </Link>

        <Link href="/matches">
          <span>❤️</span>
          <small>Matches</small>
        </Link>

        <Link href="/profile">
          <span>👤</span>
          <small>Profile</small>
        </Link>

      </nav>

    </main>
  )
}
