'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function signup() {
    setMsg('')

    if (!email || password.length < 6) {
      setMsg('Enter a valid email and a password of at least 6 characters.')
      return
    }

    setBusy(true)

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

    const { data, error } = await createClient().auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${siteUrl}/dashboard`
  }
})

if (!error && data.user && name.trim()) {
  await createClient()
    .from('profiles')
    .update({
      display_name: name.trim()
    })
    .eq('id', data.user.id)
}

    setMsg(
      error
        ? error.message
        : 'Account created successfully. You can now continue to your profile.'
    )

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

        <h2>Create Your Account</h2>

        <p className="auth-subtitle">
          Join a community of amazing people
        </p>

        <div className="auth-form">
        <input
  type="text"
  placeholder="Your name"
  value={name}
  onChange={e => setName(e.target.value)}
/>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            className="login-main-button"
            onClick={signup}
            disabled={busy}
          >
            {busy ? 'Creating account...' : 'Create Account  →'}
          </button>

        </div>

        {msg && (
          <div className="auth-message">
            {msg}
          </div>
        )}

        <p className="switch-auth">
          Already have an account?
          <a href="/login"> Log in</a>
        </p>

        <p className="age-notice">
          You must be 18 or older to use Mingle-Connect.
        </p>

      </section>

      <div className="auth-bottom-text">
        Good People. Great Vibes. Brighter Tomorrows. ♡
      </div>

    </main>
  )
}
