#!/bin/bash
set -e

# Export correct production credentials to be inherited by all sub-builds
export VITE_SUPABASE_URL="https://mqosgmfglpvdoxflwafx.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3NnbWZnbHB2ZG94Zmx3YWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzA5MjAsImV4cCI6MjA4NzQ0NjkyMH0.TwN5ZXgt1kuTU6nA-Lt6IatEHk0v1jibxykblEGfoEE"
export VITE_SOLANA_RPC="https://api.devnet.solana.com"

echo "--- Building Dashboard ---"
cd dashboard
npm install
npm run build

echo "--- Building App Demo ---"
cd ../airvent-demo
npm install
npm run build

echo "--- Integrating App Demo into Dashboard ---"
mkdir -p ../dashboard/dist/demo
cp -r dist/* ../dashboard/dist/demo/
echo "--- Build Complete ---"
