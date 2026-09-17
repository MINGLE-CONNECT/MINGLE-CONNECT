'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Product={id:string;name:string;duration_minutes:number;price_kobo:number;description:string|null}
type Boost={id:string;status:string;starts_at:string|null;expires_at:string|null;amount_kobo:number}

export default function BoostPage(){
 const c=createClient()
 const [products,setProducts]=useState<Product[]>([])
 const [boost,setBoost]=useState<Boost|null>(null)
 const [loading,setLoading]=useState(true)
 const [busy,setBusy]=useState<string|null>(null)
 const [msg,setMsg]=useState('')
 const [paymentStatus,setPaymentStatus]=useState('')

 useEffect(()=>{
  const status=new URLSearchParams(window.location.search).get('payment')||''
  setPaymentStatus(status)
  if(status==='success')setMsg('Payment successful. Your boost is now active! 🚀')
  if(status==='failed')setMsg('Payment was not completed. No boost was activated.')
  if(status==='config')setMsg('Payment setup is not complete yet.')
  load()
 },[])
 async function load(){
  const {data:{user}}=await c.auth.getUser()
  if(!user){window.location.href='/login';return}
  const [{data:p,error:pe},{data:b,error:be}]=await Promise.all([
   c.from('boost_products').select('id,name,duration_minutes,price_kobo,description').eq('is_active',true).order('duration_minutes'),
   c.from('boosts').select('id,status,starts_at,expires_at,amount_kobo').eq('user_id',user.id).eq('status','active').order('expires_at',{ascending:false}).limit(1).maybeSingle()
  ])
  if(pe){setMsg(pe.message)} else setProducts(p||[])
  if(!be)setBoost(b)
  setLoading(false)
 }
 async function buy(product:Product){
  setBusy(product.id);setMsg('')
  const {data:{session}}=await c.auth.getSession()
  if(!session){window.location.href='/login';return}
  const r=await fetch('/api/paystack/initialize',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({productId:product.id})})
  const j=await r.json()
  if(!r.ok){setMsg(j.error||'Unable to start payment.');setBusy(null);return}
  window.location.href=j.authorization_url
 }
 function money(kobo:number){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(kobo/100)}
 function expiry(){if(!boost?.expires_at)return '';return new Date(boost.expires_at).toLocaleString('en-NG')}
 if (loading) {
  return (
    <main className="boost-page">
      <div className="boost-loading">
        🚀 Loading boost options... ❤️
      </div>
    </main>
  )
}

return (
  <main className="boost-page">

    <header className="boost-header">
      <a href="/dashboard" className="boost-back">←</a>

      <div>
        <strong>Mingle-Connect</strong>
        <small>Premium</small>
      </div>

      <span>⭐</span>
    </header>

    <section className="boost-content">

      <div className="boost-hero">
        <div className="boost-hero-icon">🚀⭐</div>

        <h1>Boost your profile</h1>

        <p>
          Get more visibility and increase your chances
          of getting a match. ❤️
        </p>
      </div>

      {boost && (
        <div className="active-boost-card">
          <div className="active-boost-icon">🚀</div>

          <div>
            <strong>Your profile is boosted! 🎉</strong>
            <span>
              Active until{' '}
              {new Date(boost.expires_at).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {msg && (
        <div className="boost-message">
          {msg}
        </div>
      )}

      <div className="boost-products">

        {products.map(product => (
          <article
            className="boost-product-card"
            key={product.id}
          >

            <div className="boost-product-icon">
              🚀
            </div>

            <div className="boost-product-info">
              <h2>{product.name}</h2>

              <p>
                {product.description ||
                  `Get increased visibility for ${product.duration_minutes} minutes.`}
              </p>

              <div className="boost-product-bottom">

                <strong>
                  {money(product.price_kobo)}
                </strong>

                <button
                  type="button"
                  onClick={() => buy(product)}
                  disabled={busy === product.id}
                  className="boost-buy-button"
                >
                  {busy === product.id
                    ? 'Opening payment...'
                    : 'Boost Now 🚀'}
                </button>

              </div>
            </div>

          </article>
        ))}

      </div>

      <div className="boost-security">
        <div>🔒</div>
        <p>
          Payments are processed securely by Paystack.
          Your boost is activated only after payment
          verification.
        </p>
      </div>

    </section>

    <nav className="bottom-nav">

      <a href="/dashboard">
        <span>🏠</span>
        <small>Home</small>
      </a>

      <a href="/discover">
        <span>🔎</span>
        <small>Discover</small>
      </a>

      <a href="/matches">
        <span>💬</span>
        <small>Messages</small>
      </a>

      <a href="/matches">
        <span>❤️</span>
        <small>Matches</small>
      </a>

      <a href="/profile">
        <span>👤</span>
        <small>Profile</small>
      </a>

    </nav>

  </main>
)
}
