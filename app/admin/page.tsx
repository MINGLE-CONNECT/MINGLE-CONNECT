'use client'
import {useEffect,useState} from 'react'
import {createClient} from '../../lib/supabase'
type Report={id:string;reporter_id:string;reported_user_id:string;reason:string;details:string|null;status:string;created_at:string}
export default function Admin(){const[reports,setReports]=useState<Report[]>([]),[allowed,setAllowed]=useState<boolean|null>(null),[msg,setMsg]=useState('')
 useEffect(()=>{load()},[])
 async function load(){const c=createClient();const{data:{user}}=await c.auth.getUser();if(!user){location.href='/login';return}const{data:a}=await c.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();if(!a){setAllowed(false);return}setAllowed(true);const{data,error}=await c.from('reports').select('*').order('created_at',{ascending:false});if(error)setMsg(error.message);else setReports(data||[])}
 async function update(id:string,status:string){const{error}=await createClient().from('reports').update({status}).eq('id',id);if(error)setMsg(error.message);else setReports(x=>x.map(r=>r.id===id?{...r,status}:r))}
 if(allowed===null)return <main className="auth"><div className="card">Checking admin access...</div></main>
 if(!allowed)return <main className="auth"><div className="card"><h1>Access denied</h1><p>This area is restricted to Mingle-Connect administrators.</p><a className="primary" href="/dashboard">Back to dashboard</a></div></main>
 return <main className="admin"><nav><b>Mingle-Connect Admin</b><a href="/dashboard">Dashboard</a></nav><section><h1>Reports</h1>{msg&&<div className="notice">{msg}</div>}{!reports.length?<p>No reports yet.</p>:reports.map(r=><article className="reportCard" key={r.id}><div><b>{r.reason}</b><span className="status">{r.status}</span><small>{new Date(r.created_at).toLocaleString()}</small></div><p>{r.details||'No additional details.'}</p><small>Reported user: {r.reported_user_id}</small><div className="adminBtns"><button onClick={()=>update(r.id,'reviewed')}>Mark reviewed</button><button onClick={()=>update(r.id,'resolved')}>Resolve</button></div></article>)}</section></main>
}
