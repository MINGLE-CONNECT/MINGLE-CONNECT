'use client'
import {useEffect,useState} from 'react'
import {createClient} from '../../lib/supabase'

type Person={id:string;display_name:string;date_of_birth:string;gender:string;interested_in:string;location:string;bio:string;boosted?:boolean}
type Photo={storage_path:string;sort_order:number}

export default function Discover(){
 const [people,setPeople]=useState<Person[]>([]),[photos,setPhotos]=useState<Record<string,Photo[]>>({}),[i,setI]=useState(0),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
 const c=createClient()
 useEffect(()=>{load()},[])
 async function load(){const {data:{user}}=await c.auth.getUser();if(!user){window.location.href='/login';return}
 const {data:p,error}=await c.from('profiles').select('id,display_name,date_of_birth,gender,interested_in,location,bio').neq('id',user.id).order('created_at',{ascending:false})
 if(error){setMsg(error.message);setLoading(false);return}
 const {data:likes}=await c.from('likes').select('liked_id').eq('liker_id',user.id)
 const liked=new Set((likes||[]).map(x=>x.liked_id))
 const candidates: Person[]=(p||[]).filter(x=>!liked.has(x.id))
 const {data:activeBoosts}=await c.from('boosts').select('user_id').eq('status','active').gt('expires_at',new Date().toISOString())
 const boosted=new Set((activeBoosts||[]).map(x=>x.user_id))
 candidates.forEach(x=>x.boosted=boosted.has(x.id))
 candidates.sort((a,b)=>Number(Boolean(b.boosted))-Number(Boolean(a.boosted)))
 setPeople(candidates)
 if(candidates.length){const {data:ph}=await c.from('profile_photos').select('user_id,storage_path,sort_order').in('user_id',candidates.map(x=>x.id)).order('sort_order');const map:Record<string,Photo[]>={};(ph||[]).forEach(x=>(map[x.user_id]??=[]).push(x));setPhotos(map)}
 setLoading(false)}
 function age(d:string){return Math.floor((Date.now()-new Date(d).getTime())/31557600000)}
 function url(p:string){return c.storage.from('profile-photos').getPublicUrl(p).data.publicUrl}
 async function like(){if(!people[i]||busy)return;setBusy(true);const {data:{user}}=await c.auth.getUser();if(!user){window.location.href='/login';return}
 const target=people[i]
 const {error}=await c.from('likes').insert({liker_id:user.id,liked_id:target.id})
 if(error && !error.message.toLowerCase().includes('duplicate'))setMsg(error.message)
 else {const {data:mutual}=await c.from('likes').select('id').eq('liker_id',target.id).eq('liked_id',user.id).maybeSingle();if(mutual)setMsg(`It's a match with ${target.display_name}! 💕`)}
 next()}
 async function pass(){if(busy)return;next()}
 function next(){setI(x=>x+1);setBusy(false)}
 if(loading)return <main className="discover"><p>Finding people...</p></main>
 const p=people[i]
 return <main className="discover"><nav><b>Mingle-Connect</b><div><a href="/matches">Matches</a> · <a href="/dashboard">Profile</a></div></nav>
 <section className="discoverWrap">{msg&&<div className="notice">{msg}</div>}{!p?<div className="empty"><h1>No more profiles</h1><p>You've reached the end of the current list.</p><button onClick={load}>Refresh</button></div>:
 <div className="profileCard">{photos[p.id]?.[0]?<img className="mainPhoto" src={url(photos[p.id][0].storage_path)} alt={p.display_name}/>:<div className="noPhoto">No photo</div>}<div className="profileInfo">{p.boosted&&<div className="boostBadge">🚀 Boosted profile</div>}<h1>{p.display_name}, {age(p.date_of_birth)}</h1><div className="muted">{p.gender} · {p.location||'Location not set'}</div><p>{p.bio||'No bio yet.'}</p><div className="buttons"><button className="pass" onClick={pass}>✕ Pass</button><button className="like" onClick={like}>♥ Like</button></div><div className="safetyLinks"><a href={'/report?user='+p.id}>🚩 Report</a><button type="button" onClick={async()=>{const{data:{user}}=await c.auth.getUser();if(user){await c.from('blocks').insert({blocker_id:user.id,blocked_id:p.id});setMsg('User blocked.');next()}}}>🚫 Block</button></div></div></div>}</section></main>
}
