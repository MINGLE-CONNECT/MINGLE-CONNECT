import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req:NextRequest){
 const reference=new URL(req.url).searchParams.get('reference')
 const site=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin
 if(!reference)return NextResponse.redirect(`${site}/boost?payment=missing`)
 const secret=process.env.PAYSTACK_SECRET_KEY
 const service=process.env.SUPABASE_SECRET_KEY
 if(!secret||!service)return NextResponse.redirect(`${site}/boost?payment=config`)
 const verify=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${secret}`}})
 const result=await verify.json()
 if(!verify.ok||!result.status||result.data?.status!=='success')return NextResponse.redirect(`${site}/boost?payment=failed`)
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,service)
 const {data:pending}=await admin.from('boosts').select('id,user_id,product_id,amount_kobo,status').eq('payment_reference',reference).maybeSingle()
 if(!pending)return NextResponse.redirect(`${site}/boost?payment=notfound`)
 if(pending.status!=='active'){
  const {data:product}=await admin.from('boost_products').select('duration_minutes').eq('id',pending.product_id).maybeSingle()
  if(product){
   const start=new Date()
   const expires=new Date(start.getTime()+product.duration_minutes*60000)
   await admin.from('boosts').update({status:'active',starts_at:start.toISOString(),expires_at:expires.toISOString()}).eq('id',pending.id)
  }
 }
 return NextResponse.redirect(`${site}/boost?payment=success`)
}
