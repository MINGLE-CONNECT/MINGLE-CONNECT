# Mingle-Connect — Stage 8B

Stage 8B adds the mobile-first Boost page and Paystack payment flow scaffold.

## What is included
- `/boost` with 30-minute ₦500, 1-hour ₦1,000 and 3-hour ₦2,000 packages.
- Server-side Paystack transaction initialization.
- Paystack callback verification before a boost is activated.
- Boost expiry fields and status handling.
- Dashboard link to Boost.

## Supabase setup
Run `supabase/boosts-stage8b.sql` in Supabase SQL Editor after the Stage 8A SQL already completed.

## Environment variables
Use `.env.example` as a guide. Keep `PAYSTACK_SECRET_KEY` and `SUPABASE_SECRET_KEY` server-only. Never put either secret in browser code.

The payment code follows Paystack's backend initialization + verification model. Do not mark a payment successful based only on a browser redirect; the server verifies the transaction first.


## Stage 8C — App payment/boost connection
The Boost page is wired to the Paystack initialization and callback routes. Discover prioritizes active boosted profiles. Use Paystack test mode first. Required server environment variables: PAYSTACK_SECRET_KEY and SUPABASE_SECRET_KEY; never expose either in browser code. Set NEXT_PUBLIC_SITE_URL to the deployed app URL.
