'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

type MatchPerson = {
  id: string
  display_name: string
  photo: string
}

export default function Matches() {
  const [matches, setMatches] = useState<MatchPerson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    const c = createClient()

    const {
      data: { user }
    } = await c.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: matchRows } = await c
      .from('matches')
      .select('id, user_id, other_id, created_at')
      .or(`user_id.eq.${user.id},other_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!matchRows) {
      setLoading(false)
      return
    }

    const output: MatchPerson[] = []

    for (const match of matchRows) {
      const otherId =
        match.user_id === user.id
          ? match.other_id
          : match.user_id

      const { data: profile } = await c
        .from('profiles')
        .select('id, display_name')
        .eq('id', otherId)
        .maybeSingle()

      const { data: photo } = await c
        .from('profile_photos')
        .select('storage_path')
        .eq('user_id', otherId)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle()

      let photoUrl = ''

      if (photo?.storage_path) {
        photoUrl = c
          .storage
          .from('profile-photos')
          .getPublicUrl(photo.storage_path)
          .data.publicUrl
      }

      output.push({
        id: match.id,
        display_name: profile?.display_name || 'Mingle member',
        photo: photoUrl
      })
    }

    setMatches(output)
    setLoading(false)
  }

  if (loading) {
    return (
      <main className="matches-page">
        <div className="matches-loading">
          Finding your matches... ❤️
        </div>
      </main>
    )
  }

  return (
    <main className="matches-page">

      <header className="matches-header">
        <Link href="/dashboard" className="matches-back">
          ←
        </Link>

        <div>
          <strong>Mingle-Connect</strong>
          <small>Your Matches</small>
        </div>

        <span>♥</span>
      </header>

      <section className="matches-content">

        <div className="matches-title">
          <div className="matches-heart">❤️</div>

          <h1>Your Matches</h1>

          <p>
            People who liked you back. Maybe something
            beautiful starts here. 💕
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="no-matches">
            <div className="no-matches-icon">💗</div>

            <h2>No matches yet</h2>

            <p>
              Keep discovering people and sending likes.
              Your next connection could be just around
              the corner.
            </p>

            <Link
              href="/discover"
              className="find-match-button"
            >
              🔎 Discover People
            </Link>
          </div>
        ) : (
          <div className="matches-list">

            <div className="matches-count">
              <strong>
                {matches.length}{' '}
                {matches.length === 1 ? 'Match' : 'Matches'}
              </strong>

              <span>❤️</span>
            </div>

            {matches.map(match => (
              <div
                className="match-card"
                key={match.id}
              >
                <div className="match-photo-wrap">

                  {match.photo ? (
                    <img
                      src={match.photo}
                      alt={match.display_name}
                      className="match-photo"
                    />
                  ) : (
                    <div className="match-photo-placeholder">
                      👤
                    </div>
                  )}

                  <div className="match-heart">
                    ❤️
                  </div>
                </div>

                <div className="match-info">
                  <h2>{match.display_name}</h2>

                  <p>
                    You both liked each other. 💕
                  </p>

                  <Link
                    href={`/chat/${match.id}`}
                    className="message-match-button"
                  >
                    💬 Send a Message
                    <span>›</span>
                  </Link>
                </div>
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

        <Link href="/messages">
          <span>💬</span>
          <small>Messages</small>
        </Link>

        <Link
          href="/matches"
          className="active"
        >
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
