'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="mc-home">

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .mc-home {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 20%, rgba(255, 20, 100, 0.18), transparent 35%),
            radial-gradient(circle at 85% 30%, rgba(180, 0, 70, 0.20), transparent 35%),
            #090508;
          color: white;
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        .nav {
          height: 78px;
          padding: 0 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(8,5,7,0.82);
          backdrop-filter: blur(12px);
          position: relative;
          z-index: 5;
        }

        .logo {
          font-size: 25px;
          font-weight: 800;
          font-family: cursive;
          color: white;
        }

        .logo span {
          color: #ff3f88;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .nav-links a {
          color: #ddd;
          text-decoration: none;
          font-size: 14px;
        }

        .nav-links a:hover {
          color: #ff4b91;
        }

        .login-link {
          border: 1px solid rgba(255,255,255,0.25);
          padding: 10px 17px;
          border-radius: 25px;
        }

        .join-link {
          background: linear-gradient(135deg, #ff2478, #ff005d);
          padding: 11px 20px;
          border-radius: 25px;
          color: white !important;
          font-weight: bold;
          box-shadow: 0 8px 25px rgba(255,0,90,0.25);
        }

        .hero {
          min-height: 650px;
          display: flex;
          align-items: center;
          padding: 70px 7%;
          position: relative;
          background:
            linear-gradient(90deg, #090508 5%, rgba(9,5,8,0.88) 38%, rgba(9,5,8,0.35) 75%, #090508 100%),
            linear-gradient(180deg, transparent 60%, #090508 100%),
            url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=85');
          background-size: cover;
          background-position: center;
        }

        .hero-content {
          max-width: 650px;
          position: relative;
          z-index: 2;
        }

        .eyebrow {
          color: #ff4d91;
          font-size: 13px;
          font-weight: bold;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .hero h1 {
          font-size: clamp(48px, 7vw, 82px);
          line-height: 0.98;
          margin: 0 0 25px;
          font-weight: 900;
          letter-spacing: -3px;
        }

        .hero h1 span {
          color: #ff3d86;
          font-family: cursive;
          font-style: italic;
        }

        .hero-text {
          max-width: 570px;
          color: #d3ccd0;
          font-size: 18px;
          line-height: 1.7;
          margin-bottom: 30px;
        }

        .hero-buttons {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .primary-btn,
        .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 150px;
          padding: 15px 25px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: bold;
          transition: 0.2s;
        }

        .primary-btn {
          color: white;
          background: linear-gradient(135deg, #ff2478, #e6005c);
          box-shadow: 0 10px 35px rgba(255,0,90,0.3);
        }

        .secondary-btn {
          color: white;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.05);
        }

        .primary-btn:hover,
        .secondary-btn:hover {
          transform: translateY(-2px);
        }

        .social-proof {
          margin-top: 28px;
          color: #aaa;
          font-size: 13px;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .feature {
          padding: 30px 15px;
          text-align: center;
          background: #0d080b;
        }

        .feature-icon {
          font-size: 25px;
          margin-bottom: 10px;
        }

        .feature strong {
          display: block;
          font-size: 18px;
          margin-bottom: 6px;
        }

        .feature span {
          color: #999;
          font-size: 13px;
        }

        .simple {
          padding: 90px 7%;
          text-align: center;
        }

        .section-label {
          color: #ff4089;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 12px;
          font-weight: bold;
        }

        .simple h2 {
          font-size: clamp(35px, 5vw, 55px);
          margin: 12px 0 45px;
        }

        .simple h2 span {
          color: #ff4089;
          font-family: cursive;
          font-style: italic;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          max-width: 1050px;
          margin: auto;
        }

        .step {
          background: linear-gradient(145deg, #1a0d13, #0f080b);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 35px 25px;
          text-align: left;
        }

        .step-number {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,48,125,0.14);
          color: #ff4b91;
          font-weight: bold;
          margin-bottom: 25px;
        }

        .step h3 {
          font-size: 21px;
          margin-bottom: 12px;
        }

        .step p {
          color: #a9a1a5;
          line-height: 1.7;
          font-size: 14px;
        }

        .quote-section {
          padding: 80px 7%;
          text-align: center;
          background:
            radial-gradient(circle, rgba(255,30,110,0.18), transparent 55%),
            #10070b;
        }

        .quote-section h2 {
          font-size: clamp(34px, 5vw, 60px);
          margin: 0 0 15px;
        }

        .quote-section p {
          color: #aaa;
          font-size: 17px;
        }

        .final-btn {
          display: inline-block;
          margin-top: 25px;
          padding: 16px 32px;
          border-radius: 30px;
          background: #ff287c;
          color: white;
          text-decoration: none;
          font-weight: bold;
        }

        .footer {
          padding: 40px 7%;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          color: #777;
          font-size: 13px;
        }

        .footer-brand {
          color: white;
          font-family: cursive;
          font-size: 22px;
        }

        .footer-brand span {
          color: #ff3d86;
        }

        @media (max-width: 850px) {
          .nav-links a:not(.login-link):not(.join-link) {
            display: none;
          }

          .features {
            grid-template-columns: repeat(2, 1fr);
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .hero {
            min-height: 620px;
            padding: 70px 6%;
            background-position: 65% center;
          }
        }

        @media (max-width: 500px) {
          .nav {
            height: 68px;
            padding: 0 5%;
          }

          .logo {
            font-size: 21px;
          }

          .login-link {
            padding: 8px 12px;
          }

          .join-link {
            padding: 9px 13px;
          }

          .hero h1 {
            font-size: 50px;
          }

          .hero-text {
            font-size: 16px;
          }

          .features {
            grid-template-columns: 1fr 1fr;
          }

          .feature {
            padding: 24px 10px;
          }

          .footer {
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>

      <nav className="nav">
        <div className="logo">
          Mingle<span>-Connect</span> ♥
        </div>

        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/discover">Discover</Link>
          <a href="#about">About</a>
          <a href="#how">How It Works</a>
          <a href="#safety">Safety</a>
          <Link href="/login" className="login-link">Login</Link>
          <Link href="/signup" className="join-link">Join Now</Link>
        </div>
      </nav>

      <section className="hero" id="about">
        <div className="hero-content">
          <div className="eyebrow">PEOPLE • CONVERSATIONS • POSSIBILITIES</div>

          <h1>
            More Than<br />
            <span>Swipes.</span><br />
            Real Connections.
          </h1>

          <p className="hero-text">
            Meet amazing singles, chat, call, and vibe.
            Love, friendship or something in between —
            it all starts here.
          </p>

          <div className="hero-buttons">
            <Link href="/signup" className="primary-btn">
              Join Now ♥
            </Link>

            <Link href="/discover" className="secondary-btn">
              Explore Singles
            </Link>
          </div>

          <div className="social-proof">
            ♥ Join people already looking for real connections.
          </div>
        </div>
      </section>

      <section className="features" id="safety">
        <div className="feature">
          <div className="feature-icon">♥</div>
          <strong>Real People</strong>
          <span>Meet genuine singles</span>
        </div>

        <div className="feature">
          <div className="feature-icon">💬</div>
          <strong>Conversations</strong>
          <span>Chat and connect</span>
        </div>

        <div className="feature">
          <div className="feature-icon">🔒</div>
          <strong>Safe & Secure</strong>
          <span>Your privacy matters</span>
        </div>

        <div className="feature">
          <div className="feature-icon">📞</div>
          <strong>Calls</strong>
          <span>Take connections further</span>
        </div>

        <div className="feature">
          <div className="feature-icon">🚀</div>
          <strong>Boost Visibility</strong>
          <span>Get noticed faster</span>
        </div>
      </section>

      <section className="simple" id="how">
        <div className="section-label">How it works</div>

        <h2>
          It’s <span>Simple.</span>
        </h2>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Create Your Profile</h3>
            <p>
              Show the real you with your photos, bio,
              location and interests.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Discover & Connect</h3>
            <p>
              Find people who match your vibe and
              discover new possibilities.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Chat & Build</h3>
            <p>
              Start meaningful conversations and
              build genuine connections.
            </p>
          </div>
        </div>
      </section>

      <section className="quote-section">
        <h2>Good People.<br />Better Connections.</h2>
        <p>Same vibes? Let’s connect. ♥</p>

        <Link href="/signup" className="final-btn">
          Start Your Journey
        </Link>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          Mingle<span>-Connect</span> ♥
        </div>

        <div>
          © 2026 Mingle-Connect • Real People • Real Connections
        </div>
      </footer>

    </main>
  )
}
