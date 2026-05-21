import { supabase } from "./lib/supabaseClient";

export const TEST_EMAIL = (import.meta.env.VITE_JUDGE_EMAIL || "judge@primer.kr").trim().toLowerCase();
export const TEST_PASSWORD = (import.meta.env.VITE_JUDGE_PASSWORD || "airvent2026").trim();

export async function isAuthed(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function loginWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

function buildEmailRedirectTo(next = "/", lang?: string) {
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (lang) params.set("lang", lang);

  const origin = window.location.origin.replace(/\/$/, "");
  const query = params.toString();
  return `${origin}/auth/callback${query ? `?${query}` : ""}`;
}

export async function signUpWithEmail(email: string, password: string, nickname: string, next?: string, lang?: string) {
  return await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { nickname },
      emailRedirectTo: buildEmailRedirectTo(next, lang),
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
    .maybeSingle();
  return { data: data?.nickname ?? null, error };
}

export async function saveNickname(userId: string, nickname: string) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, nickname }, { onConflict: 'id' });
  return { data, error };
}

export async function logout(): Promise<void> {
  console.log("[Auth] logout starting...");
  
  // Create a timeout promise to ensure we don't hang forever
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Logout timed out")), 2500)
  );

  try {
    // Attempt official sign out with tobacco
    await Promise.race([supabase.auth.signOut(), timeoutPromise]);
    console.log("[Auth] signOut success");
  } catch (err) {
    console.warn("[Auth] signOut failed or timed out, forcing local cleanup:", err);
  } finally {
    // Forcefully clear all Supabase related items from local storage as a fallback
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          localStorage.removeItem(key);
          i--; // adjust index after removal
        }
      }
      console.log("[Auth] local storage cleanup complete");
    } catch (e) {
      console.error("[Auth] local storage cleanup failed:", e);
    }
  }
}
