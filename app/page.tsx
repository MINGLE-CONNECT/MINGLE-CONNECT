'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="home-page">

      <div className="home-background"></div>

      <section className="home-card">

        <div className="home-logo">
          ♡
        </div>

        <h1>
          Mingle-<span>Connect</span>
        </h1>

        <div className="home-tagline">
          MEET <b>♥</b> CHAT <b>♥</b> BELONG
        </div>

        <h2>
          Real People.<br />
          Real Connections.
        </h2>

        <p className="home-subtitle">
          Find meaningful people, create beautiful stories. ❤️
        </p>

        <div className="home-buttons">

          <Link href="/signup" className="home-button primary">
            <span>♡</span>
            Create Your Account
            <b>→</b>
          </Link>

          <Link href="/login" className="home-button secondary">
            <span>♥</span>
            Log In
            <b>→</b>
          </Link>

        </div>

        <div className="home-features">
          <div>
            <strong>💕</strong>
            <span>Meet</span>
          </div>

          <div>
            <strong>💬</strong>
            <span>Chat</span>
          </div>

          <div>
            <strong>❤️</strong>
            <span>Connect</span>
          </div>
        </div>

        <p className="home-age">
          🔞 You must be 18 or older to use Mingle-Connect.
        </p>

      </section>

      <div className="home-bottom">
        Good People. Great Vibes. Brighter Tomorrows. ♡
      </div>

    </main>
  )
}
