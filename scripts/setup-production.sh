#!/usr/bin/env bash
set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is not installed. Install it first: npm install -g supabase"
  exit 1
fi

echo "Applying the idempotent production database migration..."
supabase db push

echo "Deploying authenticated Edge Functions..."
for fn in emma-chat speech-evaluate human-chat-assist turn-credentials; do
  supabase functions deploy "$fn"
done

echo "Production backend setup finished. TURN provider secrets can be added later with:"
echo "supabase secrets set METERED_DOMAIN=YOUR_DOMAIN METERED_SECRET_KEY=YOUR_SECRET"
