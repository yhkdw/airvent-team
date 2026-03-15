import { supabase } from "./lib/supabaseClient";

export const TEST_EMAIL = (import.meta.env.VITE_JUDGE_EMAIL || "judge@primer.kr").trim().toLowerCase();
export const TEST_PASSWORD = (import.meta.env.VITE_JUDGE_PASSWORD || "airvent2026").trim();

export async function isAuthed(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function loginWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, nickname: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
    },
  });
}

export async function loginWithSocial(provider: 'google' | 'twitter', next?: string, lang?: string) {
  const providerKey = provider === 'twitter' ? 'x' : provider;
  
  // Include language in redirect to maintain state after social login
  let redirectParams = next ? `next=${encodeURIComponent(next)}` : '';
  if (lang) {
    redirectParams += (redirectParams ? '&' : '') + `lang=${lang}`;
  }
  
  const redirectPath = redirectParams ? `/?${redirectParams}` : '/';
  const redirectTo = window.location.origin.endsWith('/')
    ? window.location.origin.slice(0, -1) + redirectPath
    : window.location.origin + redirectPath;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: providerKey as any,
    options: { redirectTo, skipBrowserRedirect: false }
  });

  if (error) console.error(`[Auth] Social login error:`, error);
  return { data, error };
}

export async function getNickname(userId: string): Promise<{ data: string | null; error: any }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', userId)
    .single();
  return { data: data?.nickname ?? null, error };
}

export async function saveNickname(userId: string, nickname: string) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, nickname }, { onConflict: 'id' });
  return { data, error };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
