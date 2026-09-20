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
    <style jsx>{`
      .dashboard-page {
        min-height: 100vh;
        background:
          radial-gradient(circle at 15% 20%, rgba(255, 0, 119, 0.18), transparent 35%),
          radial-gradient(circle at 90% 45%, rgba(180, 0, 90, 0.18), transparent 35%),
          #090509;
        color: #fff;
        padding-bottom: 95px;
        overflow-x: hidden;
      }

      .dashboard-page * {
        box-sizing: border-box;
      }

      .dashboard-header {
        height: 76px;
        padding: 0 6%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(8, 4, 7, 0.92);
        border-bottom: 1px solid rgba(255, 50, 140, 0.25);
        position: relative;
        z-index: 5;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 23px;
        font-family: cursive;
        font-weight: bold;
      }

      .brand-hearts {
        color: #ff2990;
        font-size: 28px;
      }

      .brand strong {
        color: #ff2d8c;
      }

      .logout-button {
        border: 1px solid rgba(255, 80, 160, 0.5);
        background: rgba(255, 255, 255, 0.04);
        color: white;
        padding: 10px 18px;
        border-radius: 25px;
        font-size: 14px;
      }

      .dashboard-hero {
        position: relative;
        padding: 35px 6% 30px;
        min-height: 530px;
        background:
          linear-gradient(90deg, rgba(7, 3, 6, 0.98) 5%, rgba(7, 3, 6, 0.72) 45%, rgba(7, 3, 6, 0.25)),
          radial-gradient(circle at center, rgba(255, 0, 100, 0.18), transparent 65%);
      }

      .signed-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 17px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 25px;
        background: rgba(255, 255, 255, 0.06);
        color: #ddd;
        margin-bottom: 20px;
        font-size: 13px;
      }

      .signed-badge::first-letter {
        color: #00e676;
      }

      .dashboard-hero h1 {
        position: relative;
        z-index: 2;
        font-size: clamp(38px, 8vw, 64px);
        line-height: 1;
        margin: 0 0 15px;
        font-weight: 900;
      }

      .dashboard-hero h1 span {
        color: #ff2388;
      }

      .hero-girl {
        position: absolute;
        right: 0;
        top: 0;
        width: 62%;
        max-width: 650px;
        height: 100%;
        z-index: 0;
        overflow: hidden;
        border-radius: 0 0 0 120px;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.65;
        mask-image: linear-gradient(to right, transparent 0%, black 45%);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 45%);
      }

      .email {
        position: relative;
        z-index: 2;
        color: #ffb6d5;
        font-size: 14px;
        margin: 8px 0 25px;
      }

      .hero-text {
        position: relative;
        z-index: 2;
        color: #ddd;
        font-size: 16px;
        line-height: 1.6;
        max-width: 480px;
      }

      .romantic-text {
        position: relative;
        z-index: 2;
        color: #ff6ba9;
        font-family: cursive;
        font-size: 23px;
        margin-top: 18px;
      }

      .main-actions {
        position: relative;
        z-index: 3;
        display: grid;
        gap: 14px;
        max-width: 900px;
        margin: -5px auto 35px;
        padding: 0 6%;
      }

      .action-button {
        min-height: 82px;
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 18px 25px;
        border-radius: 24px;
        text-decoration: none;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.05);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.28);
        transition: 0.2s;
      }

      .action-button:hover {
        transform: translateY(-2px);
        border-color: #ff2488;
      }

      .action-button.pink {
        background: linear-gradient(135deg, #ff1680, #c90062);
        border-color: #ff409a;
      }

      .action-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 0, 110, 0.25);
        font-size: 27px;
        flex-shrink: 0;
      }

      .action-text {
        flex: 1;
        font-size: 19px;
        font-weight: bold;
      }

      .action-arrow {
        font-size: 30px;
      }

      .quick-title {
        max-width: 900px;
        margin: 0 auto 18px;
        padding: 0 6%;
        font-size: 32px;
      }

      .quick-title::after {
        content: "";
        display: block;
        width: 42px;
        height: 4px;
        margin-top: 9px;
        border-radius: 5px;
        background: #ff2388;
      }

      .quick-actions {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 6%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      .quick-card {
        min-height: 135px;
        padding: 22px;
        border-radius: 22px;
        text-decoration: none;
        color: white;
        border: 1px solid rgba(255, 80, 160, 0.28);
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.08),
          rgba(255, 0, 100, 0.04)
        );
        box-shadow: inset 0 0 30px rgba(255, 0, 100, 0.03);
      }

      .quick-card > div {
        font-size: 28px;
        margin-bottom: 12px;
      }

      .quick-card strong {
        display: block;
        font-size: 17px;
        margin-bottom: 8px;
      }

      .quick-card small {
        color: #bcaeb6;
        line-height: 1.5;
      }

      .romantic-banner {
        max-width: 900px;
        margin: 40px auto;
        padding: 28px;
        text-align: center;
        border: 1px solid #ff2388;
        border-radius: 25px;
        background: rgba(255, 0, 100, 0.07);
      }

      .romantic-banner span {
        display: block;
        color: #ff438f;
        font-size: 35px;
        margin-bottom: 5px;
      }

      .romantic-banner strong {
        font-family: cursive;
        font-size: 21px;
        color: #fff;
      }

      .bottom-nav {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        height: 82px;
        background: rgba(8, 4, 7, 0.97);
        backdrop-filter: blur(14px);
        border-top: 1px solid rgba(255, 50, 140, 0.25);
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        z-index: 20;
      }

      .bottom-nav a {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #a99ca4;
        text-decoration: none;
        font-size: 12px;
      }

      .bottom-nav a span {
        font-size: 25px;
      }

      .bottom-nav a.active {
        color: #ff2388;
      }

      .bottom-nav a.active span {
        filter: drop-shadow(0 0 8px rgba(255, 35, 136, 0.7));
      }

      @media (max-width: 600px) {
        .dashboard-header {
          padding: 0 5%;
        }

        .brand {
          font-size: 20px;
        }

        .logout-button {
          padding: 8px 14px;
        }

        .dashboard-hero {
          min-height: 470px;
          padding: 30px 6%;
        }

        .hero-girl {
          width: 100%;
          opacity: 0.72;
          border-radius: 0;
        }

        .hero-image {
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 42%,
            black 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 42%,
            black 100%
          );
        }

        .dashboard-hero h1 {
          font-size: 43px;
        }

        .main-actions {
          margin-top: -10px;
        }

        .action-button {
          min-height: 76px;
        }

        .action-text {
          font-size: 16px;
        }

        .quick-actions {
          gap: 12px;
        }

        .quick-card {
          min-height: 145px;
          padding: 17px;
        }

        .quick-card strong {
          font-size: 16px;
        }
      }
    `}</style>

    {/* HEADER */}
    <header className="dashboard-header">
      <div className="brand">
        <span className="brand-hearts">♡</span>
        Mingle-<strong>Connect</strong>
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
      <div className="hero-girl">
        <img
          src="/mingle-girl-optimized.jpg"
          alt="Mingle-Connect"
          className="hero-image"
        />
      </div>

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
        Find meaningful people, create beautiful stories. ♥
      </p>

      <p className="romantic-text">
        Good People. Great Vibes. Brighter Tomorrows. ♡
      </p>
    </section>

    {/* MAIN ACTIONS */}
    <div className="main-actions">
      <Link href="/profile" className="action-button pink">
        <span className="action-icon">👤</span>
        <span className="action-text">Create / Edit my profile</span>
        <span className="action-arrow">›</span>
      </Link>

      <Link href="/discover" className="action-button">
        <span className="action-icon">⌕</span>
        <span className="action-text">Discover People</span>
        <span className="action-arrow">›</span>
      </Link>

      <Link href="/boost" className="action-button">
        <span className="action-icon">🚀</span>
        <span className="action-text">Boost My Profile</span>
        <span className="action-arrow">›</span>
      </Link>
    </div>

    {/* QUICK ACTIONS */}
    <h2 className="quick-title">What's next?</h2>

    <div className="quick-actions">
      <Link href="/messages" className="quick-card">
        <div>💬</div>
        <strong>Messages</strong>
        <small>Chat, laugh, get closer</small>
      </Link>

      <Link href="/matches" className="quick-card">
        <div>♥</div>
        <strong>Matches</strong>
        <small>Maybe your special someone</small>
      </Link>

      <Link href="/profile-views" className="quick-card">
        <div>👁</div>
        <strong>Profile Views</strong>
        <small>
          {viewCount === 0
            ? 'No views yet'
            : `${viewCount} ${viewCount === 1 ? 'person has' : 'people have'} viewed you`}
        </small>
      </Link>

      <Link href="/boost" className="quick-card">
        <div>♛</div>
        <strong>Premium</strong>
        <small>Unlock more ways to connect</small>
      </Link>
    </div>

    {/* ROMANTIC BANNER */}
    <div className="romantic-banner">
      <span>♡</span>
      <strong>
        “Find meaningful people, create beautiful stories.”
      </strong>
    </div>

    {/* BOTTOM NAVIGATION */}
    <nav className="bottom-nav">
      <Link href="/dashboard" className="active">
        <span>⌂</span>
        <small>Home</small>
      </Link>

      <Link href="/discover">
        <span>⌕</span>
        <small>Discover</small>
      </Link>

      <Link href="/messages">
        <span>💬</span>
        <small>Messages</small>
      </Link>

      <Link href="/profile">
        <span>♙</span>
        <small>Profile</small>
      </Link>
    </nav>
    </main>
)
}

