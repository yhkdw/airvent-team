#!/bin/bash
set -e
echo "--- Building Dashboard ---"
cd dashboard
npm install
VITE_SUPABASE_URL=https://mqosgmfglpvdoxflwafx.supabase.co \
VITE_SUPABASE_ANON_KEY=sb_publishable_KDnZDq1fPpYEP2Wbld0tcw_MxfesdAh \
npm run build
echo "--- Building App Demo ---"
cd ../airvent-demo
npm install
npm run build
echo "--- Integrating App Demo into Dashboard ---"
mkdir -p ../dashboard/dist/demo
cp -r dist/* ../dashboard/dist/demo/
echo "--- Build Complete ---"
