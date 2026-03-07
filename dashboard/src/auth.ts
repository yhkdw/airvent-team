import { supabase } from "./lib/supabaseClient";

// Credentials are kept for fallback/dev if needed, but primary auth moves to Supabase
export const TEST_EMAIL = (import.meta.env.VITE_JUDGE_EMAIL || "judge@primer.kr").trim().toLowerCase();
export const TEST_PASSWORD = (import.meta.env.VITE_JUDGE_PASSWORD || "airvent2026").trim();

export async function isAuthed(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function loginWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function loginWithSocial(provider: 'google' | 'twitter' | 'naver' | 'kakao') {
  const providerKey = provider === 'twitter' ? 'x' : provider;
  console.log(`[Auth] Initiating social login for provider: ${providerKey}`);
  console.log(`[Auth] Redirect: ${window.location.origin}/dashboard`);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: providerKey as any,
    options: {
      redirectTo: window.location.origin + '/dashboard',
      skipBrowserRedirect: false
    }
  });

  if (error) {
    console.error(`[Auth] Social login error details:`, error);
  }

  return { data, error };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
