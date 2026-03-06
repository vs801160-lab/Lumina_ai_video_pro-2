
import { createClient } from '@supabase/supabase-js';
import { GeneratedVideo, SubscriptionTier } from './types';

const getEnv = (key: string): string => {
  // Priority 1: process.env (Platform injected)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = (process.env as any)[key];
      if (val && val !== "undefined" && val !== "null") return val;
    }
  } catch (e) {}

  // Priority 2: import.meta.env (Vite)
  try {
    const env = import.meta.env;
    if (env && env[key]) return env[key];
    
    // Priority 3: fallback to prefixed version
    const prefixed = `VITE_${key}`;
    if (env && env[prefixed]) return env[prefixed];
  } catch (e) {}

  return "";
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

console.log("Supabase Config:", { 
  urlPresent: !!supabaseUrl, 
  keyPresent: !!supabaseAnonKey,
  mode: (supabaseUrl && supabaseAnonKey) ? "Production" : "Demo" 
});

// Safe storage helper for incognito mode
const memoryStorage: Record<string, string> = {};
const safeStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key) || memoryStorage[key] || null;
    } catch (e) {
      return memoryStorage[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  }
};

// Custom storage for Supabase to handle incognito/restricted environments
const supabaseStorage = {
  getItem: (key: string) => safeStorage.getItem(key),
  setItem: (key: string, value: string) => safeStorage.setItem(key, value),
  removeItem: (key: string) => safeStorage.removeItem(key),
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? (() => {
      try {
        return createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: supabaseStorage as any
          }
        });
      } catch (e) {
        console.error("Supabase client creation failed:", e);
        return null;
      }
    })()
  : null as any;

const db = {
  isConfigured() {
    return !!(supabaseUrl && supabaseAnonKey && supabase);
  },

  async getUser() {
    if (!supabase) {
      const demoUser = safeStorage.getItem('lumina_demo_user');
      return demoUser ? JSON.parse(demoUser) : null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async signInWithGoogle() {
    if (!supabase) {
      // Simulated Login for Demo Mode
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@lumina.ai',
        user_metadata: { full_name: 'Demo Creator' }
      };
      safeStorage.setItem('lumina_demo_user', JSON.stringify(demoUser));
      window.dispatchEvent(new Event('lumina_auth_change'));
      return { user: demoUser };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) throw error;
    
    if (data?.url) {
      const authWin = window.open(data.url, 'supabase_auth', 'width=600,height=700');
      if (!authWin) {
        throw new Error("Popup blocked! Please allow popups for this site to sign in with Google.");
      }
    }
    return data;
  },

  async signOut() {
    if (!supabase) {
      safeStorage.removeItem('lumina_demo_user');
      window.location.reload();
      return;
    }
    await supabase.auth.signOut();
  },

  async getSession() {
    if (!supabase) {
      const demoUser = safeStorage.getItem('lumina_demo_user');
      return demoUser ? { user: JSON.parse(demoUser) } : null;
    }
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (user: any) => void) {
    if (!supabase) {
      const checkDemo = () => {
        const demoUser = safeStorage.getItem('lumina_demo_user');
        callback(demoUser ? JSON.parse(demoUser) : null);
      };
      checkDemo();
      window.addEventListener('storage', checkDemo);
      window.addEventListener('lumina_auth_change', checkDemo);
      return () => {
        window.removeEventListener('storage', checkDemo);
        window.removeEventListener('lumina_auth_change', checkDemo);
      };
    }
    
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (session?.user) {
        safeStorage.setItem('lumina_last_user', JSON.stringify(session.user));
        callback(session.user);
      }
    }).catch((err: any) => {
      console.error("Supabase initial session fetch failed:", err);
      // Fallback to last known user if session fetch fails
      const lastUser = safeStorage.getItem('lumina_last_user');
      if (lastUser) callback(JSON.parse(lastUser));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const user = session?.user ?? null;
      console.log("Supabase Auth Event:", _event, user ? "User Present" : "No User");
      
      if (user) {
        safeStorage.setItem('lumina_last_user', JSON.stringify(user));
        callback(user);
      } else {
        if (_event === 'SIGNED_OUT') {
          safeStorage.removeItem('lumina_last_user');
          callback(null);
        } else if (_event === 'INITIAL_SESSION' || _event === 'TOKEN_REFRESHED') {
          // Don't immediately null out if it's just a refresh/init that might be transient
          const lastUser = safeStorage.getItem('lumina_last_user');
          if (lastUser) {
            callback(JSON.parse(lastUser));
          } else {
            callback(null);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  },

  async getCredits(userId: string): Promise<number> {
    if (!supabase) {
      const credits = safeStorage.getItem(`lumina_credits_${userId}`);
      if (credits === null) {
        safeStorage.setItem(`lumina_credits_${userId}`, '10');
        return 10;
      }
      return parseInt(credits);
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('credits, last_login')
      .eq('id', userId)
      .single();

    if (error) {
      // Create profile if not exists
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert([{ id: userId, credits: 10, last_login: new Date().toISOString() }])
        .select()
        .single();
      return newProfile?.credits ?? 10;
    }

    // Daily Login Bonus Logic
    const lastLogin = new Date(data.last_login).toDateString();
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
      const newCredits = (data.credits || 0) + 5;
      await supabase
        .from('profiles')
        .update({ credits: newCredits, last_login: new Date().toISOString() })
        .eq('id', userId);
      return newCredits;
    }

    return data.credits ?? 0;
  },

  async updateCredits(userId: string, amount: number, reason: string) {
    if (!supabase) {
      const current = await this.getCredits(userId);
      const next = Math.max(0, current + amount);
      safeStorage.setItem(`lumina_credits_${userId}`, next.toString());
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    const newCredits = (profile?.credits ?? 0) + amount;
    
    const { error } = await supabase
      .from('profiles')
      .update({ credits: Math.max(0, newCredits) })
      .eq('id', userId);

    if (error) throw error;

    // Log transaction
    await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        amount,
        reason,
        created_at: new Date().toISOString()
      }]);
  },

  async getTier(userId: string): Promise<SubscriptionTier> {
    if (!supabase) return SubscriptionTier.FREE;
    const { data } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single();
    return (data?.tier as SubscriptionTier) ?? SubscriptionTier.FREE;
  },

  async uploadToStorage(blob: Blob, path: string): Promise<string> {
    if (!supabase) return URL.createObjectURL(blob);
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.mp4`;
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(`${path}/${fileName}`, blob);
    
    if (error) {
      console.error("Storage upload failed, using local URL as fallback", error);
      return URL.createObjectURL(blob);
    }
    
    const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(data.path);
    return publicUrl;
  },

  async saveVideo(video: GeneratedVideo, userId: string) {
    if (!supabase) {
      const videos = JSON.parse(safeStorage.getItem(`lumina_videos_${userId}`) || '[]');
      safeStorage.setItem(`lumina_videos_${userId}`, JSON.stringify([video, ...videos]));
      return;
    }
    const { error } = await supabase
      .from('videos')
      .insert([{
        id: video.id,
        user_id: userId,
        prompt: video.prompt,
        url: video.url,
        audio_url: video.audioUrl,
        directors_note: video.directorsNote,
        shorts_content: video.shortsContent,
        aspect_ratio: video.aspectRatio,
        resolution: video.resolution,
        style: video.style,
        is_public: false,
        created_at: new Date(video.createdAt).toISOString()
      }]);
    if (error) throw error;
  },

  async fetchVideos(userId: string): Promise<GeneratedVideo[]> {
    if (!supabase) {
      return JSON.parse(safeStorage.getItem(`lumina_videos_${userId}`) || '[]');
    }
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map((v: any) => ({
      id: v.id,
      prompt: v.prompt,
      url: v.url,
      audioUrl: v.audio_url,
      directorsNote: v.directors_note,
      shortsContent: v.shorts_content,
      createdAt: new Date(v.created_at).getTime(),
      aspectRatio: v.aspect_ratio,
      resolution: v.resolution || '720p',
      style: v.style,
      isPublic: v.is_public
    }));
  },

  async fetchPublicVideos(): Promise<GeneratedVideo[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return [];
    return data.map((v: any) => ({
      id: v.id,
      prompt: v.prompt,
      url: v.url,
      audioUrl: v.audio_url,
      directorsNote: v.directors_note,
      shortsContent: v.shorts_content,
      createdAt: new Date(v.created_at).getTime(),
      aspectRatio: v.aspect_ratio,
      resolution: v.resolution || '720p',
      style: v.style,
      isPublic: v.is_public
    }));
  },

  async updateVideoPrivacy(videoId: string, isPublic: boolean) {
    if (!supabase) return;
    await supabase
      .from('videos')
      .update({ is_public: isPublic })
      .eq('id', videoId);
  },

  async deleteVideo(videoId: string) {
    if (!supabase) {
      // Handle local deletion if needed, but for demo it's fine
      return;
    }
    await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);
  }
};

export { db, safeStorage };
