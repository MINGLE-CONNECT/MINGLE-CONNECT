'use client'

import {useState} from 'react'
import {createClient} from '../../lib/supabase'

export default function Signup(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  const [busy,setBusy]=useState(false)

  async function signup(){
    setMsg('')
    if(!email || password.length < 6){
      setMsg('Enter a valid email and a password of at least 6 characters.')
      return
    }

    setBusy(true)

    const siteUrl=process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

    const {error}=await createClient().auth.signUp({
      email,
      password,
      options:{
        emailRedirectTo:`${siteUrl}/dashboard`
      }
    })

    setMsg(
      error
        ? error.message
        : 'Account created. Check your email to verify your account.'
    )

    setBusy(false)
  }

  return (
    <main className="auth">
      <a className="back" href="/">← Back</a>

      <div className="card">
        <h1>Create account</h1>

        <p>You must be 18 or older to use Mingle-Connect.</p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />

        <button onClick={signup} disabled={busy}>
          {busy ? 'Creating account...' : 'Create account'}
        </button>

        {msg && <div className="notice">{msg}</div>}

        <p style={{marginTop:20}}>
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </main>
  )
}
