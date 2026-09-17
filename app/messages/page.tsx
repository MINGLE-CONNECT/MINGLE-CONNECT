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

    /*
      The inbox interface is being separated from Matches.
      Conversations will be connected to the direct-message
      records in the next step.
    */

    setConversations([])
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
        <Link href="/dashboard" className="messages-back">
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
          <div className="messages-title-icon">💌</div>

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
              <div
                key={conversation.id}
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
                  <h2>{conversation.name}</h2>

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
              </div>
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
