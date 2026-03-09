import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const action = url.searchParams.get('action')
    
    const CLI_ID = Deno.env.get('NAVER_CLIENT_ID') || ''
    const CLI_SECRET = Deno.env.get('NAVER_CLIENT_SECRET') || ''
    const redirectUri = `${url.origin}${url.pathname}`

    // Ensure secrets are set properly in Supabase dashboard
    if (!CLI_ID || !CLI_SECRET) {
      console.warn("NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not set in Edge Function secrets")
    }

    // 1. Initial Login Redirect
    if (action === 'login') {
        const redirectTo = url.searchParams.get('redirect_to') || 'http://localhost:5174/dashboard'
        const frontendClientId = url.searchParams.get('client_id');
        const activeClientId = frontendClientId || CLI_ID;
        const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${activeClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(redirectTo)}`
        return new Response(null, {
          status: 302,
          headers: { Location: naverAuthUrl }
        })
    }

    if (!code) {
      return new Response('OAuth code missing', { status: 400 })
    }

    const redirectTo = state || 'http://localhost:5174/dashboard';

    // 2. Exchange code for Access Token
    const tokenResponse = await fetch(`https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${CLI_ID}&client_secret=${CLI_SECRET}&code=${code}&state=${state}`)
    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      return new Response(`Naver Token Error: ${tokenData.error_description}`, { status: 400 })
    }

    const accessToken = tokenData.access_token

    // 3. Fetch User Profile
    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const profileData = await profileResponse.json()
    if (profileData.resultcode !== '00') {
      return new Response(`Naver Profile Error: ${profileData.message}`, { status: 400 })
    }

    const naverUser = profileData.response
    const email = naverUser.email
    
    if (!email) {
      return new Response('Naver account has no email attached', { status: 400 })
    }

    // 4. Connect to Supabase Auth Admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseKey) {
       return new Response('Supabase config missing', { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Try creating user, ignore error if already exists
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        avatar_url: naverUser.profile_image,
        full_name: naverUser.name || naverUser.nickname,
        provider: 'naver'
      }
    })

    // Generate magic link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo
      }
    })

    if (error) {
       return new Response(`Generate Link Error: ${error.message}`, { status: 500 })
    }

    const actionLink = data.properties?.action_link
    
    if (!actionLink) {
        return new Response(`Could not generate action link`, { status: 500 })
    }
    
    // Redirect user to the Supabase action link which authenticates them seamlessly
    return new Response(null, {
      status: 302,
      headers: {
        Location: actionLink
      }
    })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
