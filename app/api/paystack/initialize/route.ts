import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req:NextRequest){
 try{
  const auth=req.headers.get('authorization')||''
  const token=auth.startsWith('Bearer ')?auth.slice(7):''
  if(!token)return NextResponse.json({error:'Not signed in.'},{status:401})
  const body=await req.json();const productId=String(body.productId||'')
  if(!productId)return NextResponse.json({error:'Missing boost product.'},{status:400})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  const sb=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}}})
  const {data:{user},error:ue}=await sb.auth.getUser(token)
  if(ue||!user)return NextResponse.json({error:'Invalid session.'},{status:401})
  const {data:product,error:pe}=await sb.from('boost_products').select('id,name,price_kobo,duration_minutes,is_active').eq('id',productId).eq('is_active',true).maybeSingle()
  if(pe||!product)return NextResponse.json({error:'Boost product not found.'},{status:404})
  const secret=process.env.PAYSTACK_SECRET_KEY
  if(!secret)return NextResponse.json({error:'Payment service is not configured yet.'},{status:503})
  const reference=`MCBOOST-${crypto.randomUUID()}`
  const {error:ie}=await sb.from('boosts').insert({user_id:user.id,product_id:product.id,provider:'paystack',payment_reference:reference,amount_kobo:product.price_kobo,status:'pending'})
  if(ie)return NextResponse.json({error:ie.message},{status:500})
  const site=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin
  const response=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({email:user.email,amount:String(product.price_kobo),currency:'NGN',reference,callback_url:`${site}/api/paystack/callback`})})
  const data=await response.json()
  if(!response.ok||!data.status)return NextResponse.json({error:data.message||'Paystack could not initialize payment.'},{status:502})
  return NextResponse.json({authorization_url:data.data.authorization_url,reference:data.data.reference})
 }catch(e){return NextResponse.json({error:'Unable to start payment.'},{status:500})}
}
