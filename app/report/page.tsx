'use client'
import {useEffect,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {createClient} from '../../lib/supabase'

export default function Report(){
 const params=useSearchParams(); const reportedId=params.get('user')||''
 const [name,setName]=useState('this user'),[reason,setReason]=useState(''),[details,setDetails]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{if(!reportedId)return;(async()=>{const{data}=await createClient().from('profiles').select('display_name').eq('id',reportedId).maybeSingle();if(data)setName(data.display_name||'this user')})()},[reportedId])
 async function submit(){if(!reportedId||!reason)return;setBusy(true);const c=createClient();const{data:{user}}=await c.auth.getUser();if(!user){location.href='/login';return}const{error}=await c.from('reports').insert({reporter_id:user.id,reported_user_id:reportedId,reason,details:details.trim()||null});setMsg(error?error.message:'Report submitted. Thank you for helping keep Mingle-Connect safe.');setBusy(false)}
 return <main className="auth"><a className="back" href="/discover">← Back</a><div className="card"><h1>Report {name}</h1><p>Choose the reason that best describes the problem.</p><select value={reason} onChange={e=>setReason(e.target.value)}><option value="">Select a reason</option><option>Harassment or bullying</option><option>Fake or scam profile</option><option>Inappropriate content</option><option>Spam or solicitation</option><option>Threats or dangerous behavior</option><option>Underage user</option><option>Other</option></select><textarea value={details} onChange={e=>setDetails(e.target.value)} maxLength={1000} rows={5} placeholder="Optional details (max 1,000 characters)"/><button onClick={submit} disabled={busy||!reason}>{busy?'Submitting...':'Submit report'}</button>{msg&&<div className="notice">{msg}</div>}</div></main>
}
