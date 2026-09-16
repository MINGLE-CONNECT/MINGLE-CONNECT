'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Person = {
  id: string
  display_name: string
  date_of_birth: string
  gender: string
  interested_in: string
  location: string
  bio: string
  boosted?: boolean
}

type Photo = {
  storage_path: string
  sort_order: number
}

export default function Discover() {
  const [people, setPeople] = useState<Person[]>([])
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({})
  const [i, setI] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const c = createClient()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setMsg('')

    const {
      data: { user }
    } = await c.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data: p, error } = await c
      .from('profiles')
      .select(
        'id,display_name,date_of_birth,gender,interested_in,location,bio'
      )
      .neq('id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setMsg(error.message)
      setLoading(false)
      return
    }

    const { data: likes } = await c
      .from('likes')
      .select('liked_id')
      .eq('liker_id', user.id)

    const liked = new Set(
      (likes || []).map(x => x.liked_id)
    )

    const candidates: Person[] = (p || []).filter(
      x => !liked.has(x.id)
    )

    const { data: activeBoosts } = await c
      .from('boosts')
      .select('user_id')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    const boosted = new Set(
      (activeBoosts || []).map(x => x.user_id)
    )

    candidates.forEach(x => {
      x.boosted = boosted.has(x.id)
    })

    candidates.sort(
      (a, b) =>
        Number(Boolean(b.boosted)) -
        Number(Boolean(a.boosted))
    )

    setPeople(candidates)
    setI(0)

    if (candidates.length) {
      const { data: ph } = await c
        .from('profile_photos')
        .select('user_id,storage_path,sort_order')
        .in(
          'user_id',
          candidates.map(x => x.id)
        )
        .order('sort_order')

      const map: Record<string, Photo[]> = {}

      ;(ph || []).forEach(x => {
        if (!map[x.user_id]) {
          map[x.user_id] = []
        }

        map[x.user_id].push({
          storage_path: x.storage_path,
          sort_order: x.sort_order
        })
      })

      setPhotos(map)
    }

    setLoading(false)
  }

  function age(date: string) {
    return Math.floor(
      (Date.now() - new Date(date).getTime()) /
        31557600000
    )
  }

  function photoUrl(path: string) {
    return c
      .storage
      .from('profile-photos')
      .getPublicUrl(path)
      .data.publicUrl
  }

  async function like() {
    if (!people[i] || busy) return

    setBusy(true)

    const {
      data: { user }
    } = await c.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const target = people[i]

    const { error } = await c
      .from('likes')
      .insert({
        liker_id: user.id,
        liked_id: target.id
      })

    if (
      error &&
      !error.message.toLowerCase().includes('duplicate')
    ) {
      setMsg(error.message)
    } else {
      const { data: mutual } = await c
        .from('likes')
        .select('id')
        .eq('liker_id', target.id)
        .eq('liked_id', user.id)
        .maybeSingle()

      if (mutual) {
        setMsg(
          `It's a match with ${target.display_name}! 💕`
        )
      }
    }

    next()
  }

  async function block() {
    if (!people[i] || busy) return

    const {
      data: { user }
    } = await c.auth.getUser()

    if (!user) return

    await c
      .from('blocks')
      .insert({
        blocker_id: user.id,
        blocked_id: people[i].id
      })

    setMsg('User blocked.')
    next()
  }

  function pass() {
    if (busy) return
    next()
  }

  function next() {
    setI(x => x + 1)
    setBusy(false)
  }

  if (loading) {
    return (
      <main className="discover-page">
        <div className="discover-loading">
          <div className="discover-heart">♡</div>
          <h2>Finding people for you...</h2>
          <p>Good connections take a little time. ❤️</p>
        </div>
      </main>
    )
  }

  const p = people[i]
  const currentPhotos = p ? photos[p.id] || [] : []
  const mainPhoto = currentPhotos[0]

  return (
    <main className="discover-page">

      <header className="discover-header">

        <a href="/dashboard" className="discover-back">
          ←
        </a>

        <div className="discover-brand">
          <strong>Mingle-Connect</strong>
          <small>Discover People</small>
        </div>

        <span className="discover-header-heart">
          ♡
        </span>

      </header>

      <section className="discover-content">

        {msg && (
          <div className="discover-message">
            {msg}
          </div>
        )}

        {!p ? (

          <div className="discover-empty">

            <div className="empty-heart">
              ♡
            </div>

            <h1>No more profiles</h1>

            <p>
              You've reached the end of the current list.
            </p>

            <button onClick={load}>
              Find More People
            </button>

          </div>

        ) : (

          <article className="discover-card">

            <div className="discover-photo">

              {mainPhoto ? (
                <img
                  src={photoUrl(mainPhoto.storage_path)}
                  alt={p.display_name}
                />
              ) : (
                <div className="discover-no-photo">
                  <span>♡</span>
                  <strong>No photo yet</strong>
                  <small>Maybe they're just getting started.</small>
                </div>
              )}

              {p.boosted && (
                <div className="boosted-badge">
                  ⭐ Boosted
                </div>
              )}

              {currentPhotos.length > 1 && (
                <div className="photo-count">
                  📸 {currentPhotos.length}
                </div>
              )}

            </div>

            <div className="discover-info">

              <div className="discover-name-row">

                <div>
                  <h1>
                    {p.display_name || 'Mingle Member'}
                    {p.date_of_birth &&
                      `, ${age(p.date_of_birth)}`}
                  </h1>

                  <div className="discover-location">
                    📍 {p.location || 'Location not set'}
                  </div>
                </div>

                <span className="profile-heart-small">
                  ♡
                </span>

              </div>

              <div className="discover-details">

                {p.gender && (
                  <span>👤 {p.gender}</span>
                )}

                {p.interested_in && (
                  <span>❤️ {p.interested_in}</span>
                )}

              </div>

              <div className="discover-bio">
                {p.bio || 'No bio yet. ❤️'}
              </div>

              <div className="discover-actions">

                <button
                  className="discover-pass"
                  onClick={pass}
                  disabled={busy}
                >
                  <span>×</span>
                  Pass
                </button>

                <button
                  className="discover-like"
                  onClick={like}
                  disabled={busy}
                >
                  <span>♥</span>
                  Like
                </button>

              </div>

              <div className="discover-safety">

                <a href={'/report?user=' + p.id}>
                  🚩 Report
                </a>

                <button
                  type="button"
                  onClick={block}
                >
                  🚫 Block
                </button>

              </div>

            </div>

          </article>

        )}

      </section>

      <nav className="bottom-nav">

        <a href="/dashboard">
          <span>🏠</span>
          <small>Home</small>
        </a>

        <a href="/discover" className="active">
          <span>🔍</span>
          <small>Discover</small>
        </a>

        <a href="/matches">
          <span>💬</span>
          <small>Messages</small>
        </a>

        <a href="/matches">
          <span>❤️</span>
          <small>Matches</small>
        </a>

        <a href="/profile">
          <span>👤</span>
          <small>Profile</small>
        </a>

      </nav>

    </main>
  )
}
