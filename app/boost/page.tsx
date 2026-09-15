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
 if(loading)return <main className="boostPage"><p>Loading boosts...</p></main>
 return <main className="boostPage">
  <nav><a href="/discover">← Discover</a><b>Mingle-Connect</b><a href="/dashboard">Profile</a></nav>
  <section className="boostWrap">
   <div className="boostHero"><span className="pill">⭐ Premium</span><h1>Boost your profile</h1><p>Get more visibility and increase your chances of getting a match.</p></div>
   {boost&&<div className="activeBoost"><strong>🚀 Your profile is boosted</strong><span>Active until {expiry()}</span></div>}
   {msg&&<div className="notice">{msg}</div>}
   {paymentStatus&&<a className="primary" href="/boost" style={{display:'inline-block',marginBottom:16}}>Refresh boost status</a>}
   <div className="boostGrid">{products.map(p=><article className="boostCard" key={p.id}>
    <div className="boostIcon">🚀</div><h2>{p.name}</h2><p>{p.description}</p><div className="boostPrice">{money(p.price_kobo)}</div>
    <button onClick={()=>buy(p)} disabled={!!busy}>{busy===p.id?'Opening payment…':'Boost now'}</button>
   </article>)}</div>
   <p className="paymentNote">Payments are processed securely by Paystack. Your boost is activated only after payment verification.</p>
  </section>
 </main>
}
