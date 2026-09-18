'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

export default function Dashboard() {
  const [email, setEmail] = useState('')
const [viewCount, setViewCount] = useState(0)

  useEffect(() => {
    async function loadUser() {
      const { data } = await createClient().auth.getUser()
    const c = createClient()

if (data.user) {
  const { count } = await c
    .from('profile_views')
    .select('viewer_id', {
      count: 'exact',
      head: true,
    })
    .eq('viewed_user_id', data.user.id)

  setViewCount(count || 0)
}
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
        <div className="hero-girl">
  <img
  src="/mingle-girl-optimized.jpg"
   
  alt="Mingle-Connect"
  className="hero-image"
/>
    
    
    
   
    
 
         
</div>
        <p className="email">
          {email}
        </p>

        <p className="hero-text">
  Find meaningful people, create beautiful stories. ❤️
</p>
    
        

        <p className="romantic-text">
  Good People. Great Vibes. Brighter Tomorrows. ♡
</p>
     
     
    

        {/* MAIN ACTIONS */}
        <div className="main-actions">

          <Link href="/profile" className="action-button pink">
            <span>👤</span>
            <span>Create / Edit my profile</span>
            <b>›</b>
          </Link>

          <Link href="/discover" className="action-button white">
            <span>🔍</span>
            <span>Discover People</span>
            <b>›</b>
          </Link>

          <Link href="/boost" className="action-button boost-button">
  <span className="action-icon">🚀⭐</span>
  <span className="action-text">Boost My Profile</span>
  <span className="action-arrow">›</span>
</Link>

        </div>

        {/* QUICK ACTIONS */}
        <h2>What's next?</h2>

        <div className="quick-actions">

          <Link href="/messages" className="quick-card">
  <div>💬</div>
  <strong>Messages</strong>
  <small>Chat, laugh, get closer</small>
</Link>
            
          
          

          <Link href="/matches" className="quick-card">
  <div>❤️</div>
  <strong>Matches</strong>
  <small>Maybe your special someone</small>
</Link>

        <Link href="/profile-views" className="quick-card">
  <div>👁️</div>

  <strong>Profile Views</strong>

  <small>
    {viewCount === 0
      ? 'No views yet 👀'
      : `${viewCount} ${viewCount === 1 ? 'person has' : 'people have'} viewed you 👀`}
  </small>
</Link>

          <Link href="/boost" className="quick-card">
            <div>👑</div>
            <strong>Premium</strong>
<small>Unlock more ways to connect ✨</small>
            
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
