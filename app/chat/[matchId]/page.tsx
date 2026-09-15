'use client'
import {useEffect,useRef,useState} from 'react'
import {useParams} from 'next/navigation'
import {createClient} from '../../../lib/supabase'

type Message={id:string;sender_id:string;body:string;created_at:string}

export default function Chat(){
 const params=useParams(); const matchId=String(params.matchId)
 const c=createClient(); const [uid,setUid]=useState(''); const [otherName,setOtherName]=useState('Mingle member')
 const [messages,setMessages]=useState<Message[]>([]); const [body,setBody]=useState(''); const [loading,setLoading]=useState(true); const [sending,setSending]=useState(false); const endRef=useRef<HTMLDivElement>(null)

 useEffect(()=>{let channel:any
 ;(async()=>{const {data:{user}}=await c.auth.getUser();if(!user){window.location.href='/login';return}setUid(user.id)
 const {data:match,error}=await c.from('matches').select('user1_id,user2_id').eq('id',matchId).maybeSingle()
 if(error||!match||(match.user1_id!==user.id&&match.user2_id!==user.id)){window.location.href='/matches';return}
 const other=match.user1_id===user.id?match.user2_id:match.user1_id
 const {data:p}=await c.from('profiles').select('display_name').eq('id',other).maybeSingle();setOtherName(p?.display_name||'Mingle member')
 await loadMessages()
 channel=c.channel('chat-'+matchId).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'match_id=eq.'+matchId},(payload:any)=>{setMessages(prev=>prev.some(x=>x.id===payload.new.id)?prev:[...prev,payload.new as Message])}).subscribe()
 setLoading(false)})()
 return()=>{if(channel)c.removeChannel(channel)}
 },[matchId])

 async function loadMessages(){const {data,error}=await c.from('messages').select('id,sender_id,body,created_at').eq('match_id',matchId).order('created_at',{ascending:true});if(!error)setMessages(data||[])}
 useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[messages])

 async function send(){const text=body.trim();if(!text||sending)return;setSending(true);const {error}=await c.from('messages').insert({match_id:matchId,sender_id:uid,body:text});if(!error)setBody('');else alert(error.message);setSending(false)}
 if(loading)return <main className="chatPage"><p>Opening chat...</p></main>
 return <main className="chatPage"><nav><a href="/matches">← Matches</a><b>{otherName}</b><a href="/discover">Discover</a></nav><section className="chatBox"><div className="messages">{!messages.length&&<div className="emptyChat"><p>You matched with {otherName}.</p><span>Say hello 👋</span></div>}{messages.map(m=><div key={m.id} className={'bubble '+(m.sender_id===uid?'mine':'theirs')}><span>{m.body}</span><small>{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div>)}<div ref={endRef}/></div><div className="composer"><input value={body} onChange={e=>setBody(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}} maxLength={2000} placeholder="Write a message..."/><button onClick={send} disabled={sending||!body.trim()}>{sending?'...':'Send'}</button></div></section></main>
}
