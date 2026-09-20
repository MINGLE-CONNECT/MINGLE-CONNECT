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
        color: #fff;
        background:
          radial-gradient(circle at 15% 20%, rgba(255, 0, 110, .22), transparent 32%),
          radial-gradient(circle at 90% 55%, rgba(255, 0, 110, .18), transparent 35%),
          #080307;
        overflow-x: hidden;
        padding-bottom: 95px;
      }

      .dashboard-page * {
        box-sizing: border-box;
      }

      /* HEADER */
      .dashboard-header {
        height: 78px;
        padding: 0 5%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(8, 3, 7, .94);
        border-bottom: 1px solid rgba(255, 35, 130, .35);
        position: relative;
        z-index: 10;
      }

      .brand {
        color: white;
        font-size: 28px;
        font-weight: 700;
        font-family: cursive;
        letter-spacing: -1px;
      }

      .brand-hearts {
        color: #ff1984;
        font-size: 38px;
        margin-right: 7px;
      }

      .brand strong {
        color: #ff1680;
      }

      .logout-button {
        border: 1px solid rgba(255, 50, 145, .65);
        background: transparent;
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-weight: 600;
      }

      /* HERO */
      .dashboard-hero {
        min-height: 590px;
        position: relative;
        padding: 75px 5% 55px;
        overflow: hidden;
        background:
          linear-gradient(
            90deg,
            rgba(5, 2, 4, .97) 5%,
            rgba(5, 2, 4, .80) 35%,
            rgba(5, 2, 4, .25) 75%,
            rgba(5, 2, 4, .55)
          ),
          url("https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1800&q=90");
        background-size: cover;
        background-position: center;
      }

      .dashboard-hero::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 80% 30%, rgba(255, 0, 120, .25), transparent 30%),
          linear-gradient(to bottom, transparent 60%, #080307 100%);
        pointer-events: none;
      }

      .hero-content {
        position: relative;
        z-index: 2;
        max-width: 650px;
      }

      .signed-badge {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 10px 18px;
        border: 1px solid rgba(255, 150, 205, .6);
        border-radius: 30px;
        background: rgba(0, 0, 0, .28);
        margin-bottom: 25px;
        color: #eee;
      }

      .signed-badge::first-letter {
        color: #00e676;
      }

      .dashboard-hero h1 {
        font-size: clamp(45px, 7vw, 75px);
        line-height: .98;
        margin: 0;
        font-weight: 900;
        letter-spacing: -3px;
      }

      .dashboard-hero h1 span {
        color: #ff1985;
      }

      .email {
        margin: 20px 0 12px;
        color: #ffb0d1;
        font-size: 15px;
      }

      .hero-text {
        font-size: 21px;
        line-height: 1.5;
        max-width: 620px;
        margin: 0;
        color: #eee;
      }

      .romantic-text {
        color: white;
        font-family: cursive;
        font-size: 25px;
        margin-top: 15px;
      }

      /* MAIN ACTIONS */
      .main-actions {
        position: relative;
        z-index: 4;
        max-width: 1150px;
        margin: -75px auto 35px;
        padding: 0 25px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      .action-button {
        min-height: 155px;
        padding: 25px;
        border-radius: 22px;
        border: 1px solid rgba(255, 65, 150, .55);
        background: rgba(20, 8, 16, .88);
        color: white;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        position: relative;
        transition: .2s;
        backdrop-filter: blur(10px);
      }

      .action-button:hover {
        transform: translateY(-4px);
        border-color: #ff1985;
      }

      .action-button.pink {
        background: linear-gradient(135deg, #ff1680, #d00065);
        border-color: #ff3e9c;
        box-shadow: 0 12px 40px rgba(255, 0, 110, .25);
      }

      .action-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 0, 110, .32);
        font-size: 31px;
        margin-bottom: 13px;
      }

      .action-text {
        font-size: 20px;
        font-weight: 800;
      }

      .action-button::after {
        content: "›";
        position: absolute;
        right: 16px;
        bottom: 13px;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 0, 110, .32);
        font-size: 28px;
      }

      /* QUICK SECTION */
      .quick-title {
        max-width: 1150px;
        margin: 0 auto 18px;
        padding: 0 25px;
        font-size: 39px;
      }

      .quick-title::after {
        content: "";
        display: block;
        width: 50px;
        height: 4px;
        margin-top: 8px;
        background: #ff1680;
        border-radius: 5px;
      }

      .quick-actions {
        max-width: 1150px;
        margin: auto;
        padding: 0 25px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      .quick-card {
        min-height: 125px;
        padding: 22px;
        border: 1px solid rgba(255, 65, 150, .45);
        border-radius: 20px;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, .055),
          rgba(255, 0, 100, .035)
        );
        color: white;
        text-decoration: none;
        display: grid;
        grid-template-columns: 70px 1fr;
        align-items: center;
        column-gap: 14px;
        transition: .2s;
      }

      .quick-card:hover {
        border-color: #ff1680;
        transform: translateY(-2px);
      }

      .quick-card > div {
        width: 65px;
        height: 65px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(145deg, #ff1985, #9e004d);
        box-shadow: 0 0 25px rgba(255, 0, 110, .25);
        font-size: 28px;
        grid-row: span 2;
      }

      .quick-card strong {
        font-size: 19px;
      }

      .quick-card small {
        color: #c5b8bf;
        font-size: 14px;
        line-height: 1.4;
      }

      /* STATS */
      .stats {
        max-width: 1150px;
        margin: 35px auto;
        padding: 25px;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        border: 1px solid #ff1985;
        border-radius: 24px;
        background: rgba(40, 3, 20, .55);
      }

      .stat {
        text-align: center;
        padding: 8px;
        border-right: 1px solid rgba(255, 40, 140, .45);
      }

      .stat:last-child {
        border-right: none;
      }

      .stat-icon {
        font-size: 28px;
        color: #ff1985;
        margin-bottom: 7px;
      }

      .stat strong {
        display: block;
        font-size: 18px;
      }

      .stat span {
        color: #ddd;
        font-size: 13px;
      }

      /* QUOTE */
      .romantic-banner {
        max-width: 1150px;
        margin: 35px auto;
        padding: 32px;
        border: 1px solid #ff1985;
        border-radius: 24px;
        text-align: center;
        background: rgba(50, 0, 25, .55);
      }

      .romantic-banner span {
        color: #ff1985;
        font-size: 42px;
        margin-right: 18px;
      }

      .romantic-banner strong {
        font-family: Georgia, serif;
        font-style: italic;
        font-size: 23px;
      }

      /* BOTTOM NAV */
      .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 82px;
        z-index: 50;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        background: rgba(7, 3, 6, .97);
        border-top: 1px solid rgba(255, 35, 130, .5);
        backdrop-filter: blur(15px);
      }

      .bottom-nav a {
        color: #d9d0d5;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
        font-size: 12px;
      }

      .bottom-nav a span {
        font-size: 27px;
      }

      .bottom-nav a.active {
        color: #ff1985;
      }

      .bottom-nav a.active small {
        border-bottom: 3px solid #ff1985;
        padding-bottom: 5px;
      }

      @media (max-width: 800px) {
        .dashboard-header {
          height: 68px;
          padding: 0 5%;
        }

        .brand {
          font-size: 20px;
        }

        .brand-hearts {
          font-size: 28px;
        }

        .logout-button {
          padding: 8px 14px;
        }

        .dashboard-hero {
          min-height: 535px;
          padding: 45px 6% 35px;
          background-position: 65% center;
        }

        .dashboard-hero h1 {
          font-size: 48px;
        }

        .hero-text {
          font-size: 17px;
        }

        .romantic-text {
          font-size: 21px;
        }

        .main-actions {
          margin-top: -25px;
          grid-template-columns: 1fr;
          padding: 0 18px;
        }

        .action-button {
          min-height: 92px;
          flex-direction: row;
          text-align: left;
          justify-content: flex-start;
          padding: 15px 20px;
        }

        .action-icon {
          margin: 0 15px 0 0;
        }

        .action-button::after {
          top: 50%;
          bottom: auto;
          transform: translateY(-50%);
        }

        .quick-actions {
          padding: 0 18px;
        }

        .quick-title {
          padding: 0 18px;
          font-size: 31px;
        }

        .stats {
          margin: 28px 18px;
          padding: 18px 8px;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px 0;
        }

        .stat:nth-child(2),
        .stat:nth-child(4) {
          border-right: none;
        }

        .stat:nth-child(3) {
          border-right: 1px solid rgba(255, 40, 140, .45);
        }

        .romantic-banner {
          margin: 25px 18px;
          padding: 25px 15px;
        }

        .romantic-banner strong {
          font-size: 18px;
        }
      }

      @media (max-width: 480px) {
        .quick-actions {
          grid-template-columns: 1fr;
        }

        .dashboard-hero h1 {
          font-size: 42px;
        }

        .hero-text {
          font-size: 16px;
        }

        .romantic-text {
          font-size: 19px;
        }

        .stats {
          grid-template-columns: 1fr 1fr;
        }

        .brand {
          font-size: 18px;
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
      <div className="hero-content">

        <div className="signed-badge">
          🟢 Signed in as {email}
        </div>

        <h1>
          Welcome to<br />
          <span>Mingle-Connect</span>
        </h1>

        <p className="romantic-text">
          Good People. Great Vibes.<br />
          Brighter Tomorrows. ♡
        </p>

        <p className="hero-text">
          Find meaningful people, create beautiful stories.
        </p>

      </div>
    </section>

    {/* MAIN ACTIONS */}
    <div className="main-actions">

      <Link href="/profile" className="action-button pink">
        <span className="action-icon">👤</span>
        <span className="action-text">
          Create / Edit my profile
        </span>
      </Link>

      <Link href="/discover" className="action-button">
        <span className="action-icon">⌕</span>
        <span className="action-text">
          Discover People
        </span>
      </Link>

      <Link href="/boost" className="action-button">
        <span className="action-icon">🚀</span>
        <span className="action-text">
          Boost My Profile
        </span>
      </Link>

    </div>

    {/* WHAT'S NEXT */}
    <h2 className="quick-title">
      What's <span style={{ color: '#ff1985' }}>next?</span>
    </h2>

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
            : `${viewCount} ${
                viewCount === 1 ? 'person has' : 'people have'
              } viewed you`}
        </small>
      </Link>

      <Link href="/boost" className="quick-card">
        <div>♛</div>
        <strong>Premium</strong>
        <small>Unlock more ways to connect</small>
      </Link>

    </div>

    {/* STATS */}
    <section className="stats">

      <div className="stat">
        <div className="stat-icon">♟</div>
        <strong>50K+</strong>
        <span>Active Singles</span>
      </div>

      <div className="stat">
        <div className="stat-icon">💬</div>
        <strong>Real</strong>
        <span>Conversations</span>
      </div>

      <div className="stat">
        <div className="stat-icon">♢</div>
        <strong>Safe &</strong>
        <span>Secure</span>
      </div>

      <div className="stat">
        <div className="stat-icon">☎</div>
        <strong>Voice &</strong>
        <span>Video Calls</span>
      </div>

      <div className="stat">
        <div className="stat-icon">ϟ</div>
        <strong>Boost</strong>
        <span>Your Visibility</span>
      </div>

    </section>

    {/* QUOTE */}
    <div className="romantic-banner">
      <span>♡</span>
      <strong>
        “Find meaningful people, create beautiful stories.”
      </strong>
      <span>♥</span>
    </div>

    {/* BOTTOM NAV */}
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

      <Link href="/matches">
        <span>♡</span>
        <small>Matches</small>
      </Link>

      <Link href="/profile">
        <span>♙</span>
        <small>Profile</small>
      </Link>

    </nav>
  </main>
)
}
