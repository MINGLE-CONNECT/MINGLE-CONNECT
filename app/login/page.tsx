'use client'

import {useState} from 'react'
import {createClient} from '../../lib/supabase'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  const [busy,setBusy]=useState(false)

  async function login(){
    setMsg('')

    if(!email || !password){
      setMsg('Enter your email and password.')
      return
    }

    setBusy(true)

    const {error}=await createClient().auth.signInWithPassword({
      email,
      password
    })

    if(error){
      setMsg(error.message)
    }else{
      window.location.href='/dashboard'
    }

    setBusy(false)
  }

  return (
    <main className="auth">
      <a className="back" href="/">← Back</a>

      <div className="card">
        <h1>Log in</h1>

        <p>Welcome back to Mingle-Connect.</p>

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

        <button onClick={login} disabled={busy}>
          {busy ? 'Logging in...' : 'Log in'}
        </button>

        {msg && <div className="notice">{msg}</div>}

        <p style={{marginTop:20}}>
          Don't have an account? <a href="/signup">Create one</a>
        </p>
      </div>
    </main>
  )
                              }
