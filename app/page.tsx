'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="auth">
      <div className="card">
        <h1>Mingle-Connect</h1>
        <p>Meet people. Make connections. Find your match.</p>

        <div style={{display:'grid', gap:12, marginTop:24}}>
          <Link href="/signup">
            <button style={{width:'100%'}}>Create an account</button>
          </Link>

          <Link href="/login">
            <button style={{width:'100%'}}>Log in</button>
          </Link>
        </div>

        <p style={{marginTop:24, fontSize:13}}>
          You must be 18 or older to use Mingle-Connect.
        </p>
      </div>
    </main>
  )
}
