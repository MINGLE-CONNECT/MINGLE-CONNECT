'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

export default function Dashboard() {
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function loadUser() {
      const { data } = await createClient().auth.getUser()

      if (data.user) {
        setEmail(data.user.email || '')
      }
    }

    loadUser()
  }, [])

  return (
    <main className="dashboard-page">

      {/* HEADER */}
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-hearts">♡♡</span>
          <span>Mingle-<strong>Connect</strong></span>
        </div>

        <button
          className="logout-button"
          onClick={async () => {
            await createClient().auth.signOut()
            window.location.href = '/'
          }}
        >
          Log out
        </button>
      </header>

      {/* HERO */}
      <section className="dashboard-hero">

        <div className="signed-badge">
          🟢 Signed in
        </div>

        <h1>
          Welcome to<br />
          <span>Mingle-Connect</span>
        </h1>

        <p className="email">
          {email}
        </p>

        <p className="hero-text">
          Complete your dating profile to start meeting people.
        </p>

        <p className="romantic-text">
          Good People. Great Vibes. ❤️
        </p>

        {/* MAIN ACTIONS */}
        <div className="main-actions">

          <Link href="/profile" className="action-button pink">
            <span>👤</span>
            <span>Create / edit my profile</span>
            <b>›</b>
          </Link>

          <Link href="/discover" className="action-button white">
            <span>🔍</span>
            <span>Discover people</span>
            <b>›</b>
          </Link>

          <Link href="/boost" className="action-button purple">
            <span>⭐</span>
            <span>Boost my profile</span>
            <b>›</b>
          </Link>

        </div>

        {/* QUICK ACTIONS */}
        <h2>What's next?</h2>

        <div className="quick-actions">

          <Link href="/matches" className="quick-card">
            <div>💬</div>
            <strong>Messages</strong>
            <small>Chat now</small>
          </Link>

          <Link href="/matches" className="quick-card">
            <div>❤️</div>
            <strong>Matches</strong>
            <small>Your likes</small>
          </Link>

          <Link href="/profile" className="quick-card">
            <div>👁️</div>
            <strong>Profile Views</strong>
            <small>See who's interested</small>
          </Link>

          <Link href="/boost" className="quick-card">
            <div>👑</div>
            <strong>Premium</strong>
            <small>Go further</small>
          </Link>

        </div>

        {/* ROMANTIC BANNER */}
        <div className="romantic-banner">
          <span>💕</span>
          <strong>Let's make amazing connections! ❤️</strong>
          <span>💕</span>
        </div>

      </section>

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-nav">

        <Link href="/dashboard" className="active">
          <span>🏠</span>
          <small>Home</small>
        </Link>

        <Link href="/discover">
          <span>🔍</span>
          <small>Discover</small>
        </Link>

        <Link href="/matches">
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
