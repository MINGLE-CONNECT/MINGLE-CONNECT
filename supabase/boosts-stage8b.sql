-- Stage 8B: allow signed-in users to create their own pending boost.
-- Payment activation is NOT allowed from the browser; the server verifies Paystack first.

ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create own pending boosts" ON public.boosts;
CREATE POLICY "Users can create own pending boosts"
ON public.boosts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
);

CREATE INDEX IF NOT EXISTS boosts_user_status_expires_idx
ON public.boosts(user_id, status, expires_at);
