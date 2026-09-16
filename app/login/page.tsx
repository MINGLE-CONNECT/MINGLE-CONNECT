'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function login() {
    setMsg('')

    if (!email || !password) {
      setMsg('Please enter your email and password.')
      return
    }

    setBusy(true)

    const { error } = await createClient().auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMsg(error.message)
    } else {
      window.location.href = '/dashboard'
    }

    setBusy(false)
  }

  return (
    <main className="romantic-auth">

      <div className="auth-woman"></div>

      <section className="login-card">

        <div className="auth-logo">
          ♡
        </div>

        <h1>
          Mingle-<span>Connect</span>
        </h1>

        <div className="auth-tagline">
          MEET <b>♥</b> CHAT <b>♥</b> BELONG
        </div>

        <h2>Welcome Back</h2>

        <p className="auth-subtitle">
          Sign in to continue your journey
        </p>

        <div className="auth-form">

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <a href="#" className="forgot">
            Forgot password?
          </a>

          <button
            className="login-main-button"
            onClick={login}
            disabled={busy}
          >
            {busy ? 'Logging in...' : 'Log In  →'}
          </button>

        </div>

        {msg && (
          <div className="auth-message">
            {msg}
          </div>
        )}

        <div className="auth-divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <div className="social-buttons">
          <button>G</button>
          <button>f</button>
          <button>●</button>
        </div>

        <p className="switch-auth">
          Don't have an account?
          <a href="/signup"> Register</a>
        </p>

        <p className="age-notice">
          You must be 18 or older to use Mingle-Connect.
        </p>

      </section>

      <div className="auth-bottom-text">
        Let's make amazing connections! ♡
      </div>

    </main>
  )
}
