
console.log("App.tsx loading... v2.1");
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VideoCard from './components/VideoCard';
import LegalPages from './LegalPages';
import { GeminiVideoService } from './geminiService';
import { db, safeStorage } from './supabaseService';
import { GeneratedVideo, SubscriptionTier, CreditPackage, VisualStyle, AspectRatio } from './types';
import { 
  AlertCircle, Loader2, Languages, Zap, Wand2, CheckCircle2, ShieldCheck, Sparkles, CreditCard, Trash2, Music, Maximize2, Share2, MessageSquare, Type, Key, X
} from 'lucide-react';

const STYLES: VisualStyle[] = [
  { id: 'cinematic', name: 'Cinematic', prompt: 'masterpiece, 8k, cinematic lighting, ultra-realistic', image: 'https://picsum.photos/seed/cinema/800/1000' },
  { id: 'anime', name: 'Anime', prompt: 'modern anime style, vibrant colors, studio ghibli lighting', image: 'https://picsum.photos/seed/anime/800/1000' },
  { id: '3d', name: '3D Render', prompt: 'octane render, 3d animation, toy-core aesthetic', image: 'https://picsum.photos/seed/3d/800/1000' },
  { id: 'cyber', name: 'Cyberpunk', prompt: 'neon city, rainy night, synthwave aesthetic', image: 'https://picsum.photos/seed/cyber/800/1000' },
  { id: 'vintage', name: 'Vintage', prompt: '16mm film, grainy, warm colors, nostalgic', image: 'https://picsum.photos/seed/vintage/800/1000' },
];

const PACKAGES: CreditPackage[] = [
  { id: 'pkg0', name: 'Trial Pack', credits: 10, price: 99, currency: 'INR', features: ['1 Masterpiece Video', '720p Access'] },
  { id: 'pkg1', name: 'Starter', credits: 60, price: 499, currency: 'INR', features: ['6 Premium Videos', '720p Access'] },
  { id: 'pkg2', name: 'Creator Pro', credits: 300, price: 1999, currency: 'INR', features: ['30 Premium Videos', 'Priority Queue'], recommended: true },
];

const TRANSLATIONS = {
  EN: {
    hero: "LUMINA STUDIO",
    sub: "Professional Veo AI Rendering",
    placeholder: "A cinematic shot of a dragon flying over a neon city...",
    generate_btn: "GENERATE MASTERPIECE",
    refining: "Refining...",
    lang_toggle: "हिंदी",
    vault: "Your Vault",
    explore: "Global Showcase",
    pricing: "Get Credits",
    rendering: "AI is rendering...",
    success_pay: "Credits Added Successfully!",
    login_req: "Please sign in to continue",
    low_credits: "Insufficient credits. Please top up.",
    story_mode: "Director's Mode",
    story_placeholder: "Write your script here... (e.g. A cyberpunk detective enters a bar, orders a drink, and sees a mysterious woman)",
    plan_story: "Plan Cinematic Storyboard",
    planning: "Planning Storyboard...",
    scene: "Scene",
    gen_scene: "Generate Scene",
    directors_note: "Director's Note",
    audio_gen: "Audio Generated",
    no_scenes: "Failed to plan storyboard. Please try again.",
    no_vids: "No videos yet",
    share_bonus: "Share & Get +2 Credits",
    director_suite: "Director's Suite Active",
    switch_story: "Switch to Story Mode",
    choose_plan: "Choose a plan to fuel your creativity",
    select_plan: "Select Plan",
    daily_bonus: "Daily Login Bonus: +5 Credits Added!",
    sys_status: "System Status",
    connected: "Connected",
    disconnected: "Disconnected",
    api_ready: "API Ready",
    api_pending: "API Key Pending",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    refund: "Refund Policy"
  },
  HI: {
    hero: "लुमिना स्टूडियो",
    sub: "प्रोफेशनल AI वीडियो रेंडरिंग",
    placeholder: "एक जादुई शहर के ऊपर उड़ते हुए ड्रैगन का सिनेमाई शॉट...",
    generate_btn: "वीडियो बनाएँ",
    refining: "सुधार रहे हैं...",
    lang_toggle: "English",
    vault: "आपकी लाइब्रेरी",
    explore: "शोकेस",
    pricing: "क्रेडिट खरीदें",
    rendering: "बन रहा है...",
    success_pay: "क्रेडिट सफलतापूर्वक जुड़ गए!",
    login_req: "आगे बढ़ने के लिए साइन इन करें",
    low_credits: "क्रेडिट कम हैं। कृपया रिचार्ज करें।",
    story_mode: "डायरेक्टर मोड",
    story_placeholder: "अपनी कहानी यहाँ लिखें... (जैसे: एक जादुई जंगल में एक छोटा बच्चा खो गया है)",
    plan_story: "स्टोरीबोर्ड बनाएँ",
    planning: "स्टोरीबोर्ड बन रहा है...",
    scene: "दृश्य",
    gen_scene: "दृश्य बनाएँ",
    directors_note: "निर्देशक की टिप्पणी",
    audio_gen: "ऑडियो तैयार है",
    no_scenes: "स्टोरीबोर्ड बनाने में विफल। कृपया फिर से प्रयास करें।",
    no_vids: "अभी कोई वीडियो नहीं है",
    share_bonus: "शेयर करें और +2 क्रेडिट पाएं",
    director_suite: "निर्देशक सुइट सक्रिय",
    switch_story: "स्टोरी मोड पर स्विच करें",
    choose_plan: "अपनी रचनात्मकता को बढ़ावा देने के लिए एक योजना चुनें",
    select_plan: "योजना चुनें",
    daily_bonus: "दैनिक लॉगिन बोनस: +5 क्रेडिट जोड़े गए!",
    sys_status: "सिस्टम स्थिति",
    connected: "जुड़ा हुआ",
    disconnected: "डिस्कनेक्ट",
    api_ready: "API तैयार",
    api_pending: "API की प्रतीक्षा है",
    terms: "सेवा की शर्तें",
    privacy: "गोपनीयता नीति",
    refund: "वापसी नीति"
  }
};

const App: React.FC = () => {
  console.log("App component rendering... v2.2");
  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [currentView, setCurrentView] = useState('generate');
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [tier, setTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [library, setLibrary] = useState<GeneratedVideo[]>([]);
  const [showcase, setShowcase] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>(STYLES[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('16:9');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [rzpKeyFromServer, setRzpKeyFromServer] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyboard, setStoryboard] = useState<any[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [generationTime, setGenerationTime] = useState(0);
  const [initError, setInitError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.EN;

  const [showSetupHelper, setShowSetupHelper] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!db.isConfigured());

  const addDemoCredits = async () => {
    if (user) {
      await db.updateCredits(user.id, 50, "Demo Bonus");
      setCredits(prev => prev + 50);
      setSuccessMsg("50 Demo Credits Added!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg(`${label} Copied!`);
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  useEffect(() => {
    console.log("App.tsx: Setting up error listeners...");
    const errorHandler = (event: ErrorEvent) => {
      console.error("Global Error Caught:", event.error);
      setInitError(event.error?.message || "An unexpected error occurred.");
    };
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      setInitError(event.reason?.message || "A background process failed.");
    };
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  useEffect(() => {
    try {
      const savedLang = safeStorage.getItem('lumina_lang') as 'EN' | 'HI';
      if (savedLang && TRANSLATIONS[savedLang]) setLang(savedLang);
    } catch (e) {
      console.error("Lang load failed", e);
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'EN' ? 'HI' : 'EN';
    setLang(newLang);
    safeStorage.setItem('lumina_lang', newLang);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        setAuthLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    // Auth Callback Handler for Popups
    const isAuthCallback = window.location.hash.includes('access_token=') || 
                          window.location.search.includes('code=') ||
                          window.location.hash.includes('error=');
    
    if (window.opener && isAuthCallback) {
      console.log("Auth callback detected in popup, closing in 2s...");
      const timer = setTimeout(() => {
        try {
          window.opener.postMessage({ type: 'SUPABASE_AUTH_SUCCESS' }, '*');
          window.close();
        } catch (e) {
          window.close();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
        console.log("Received auth success message from popup");
        // The onAuthStateChange listener will handle the actual state update
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    console.log("App.tsx: Initializing auth and API checks...");
    const unsubscribe = db.onAuthStateChange((u: any) => {
      console.log("Auth State Changed:", u ? "User Logged In" : "User Logged Out");
      if (u) {
        setUser(u);
        refreshUserData(u.id);
        setAuthLoading(false);
      } else {
        const demoUser = safeStorage.getItem('lumina_demo_user');
        const lastUser = safeStorage.getItem('lumina_last_user');
        
        if (demoUser) {
          const parsed = JSON.parse(demoUser);
          setUser(parsed);
          refreshUserData(parsed.id);
          setAuthLoading(false);
        } else if (lastUser) {
          const parsed = JSON.parse(lastUser);
          setUser(parsed);
          refreshUserData(parsed.id);
          setAuthLoading(false);
        } else {
          setUser(null);
          setAuthLoading(false);
        }
      }
    });

    const init = async () => {
      console.log("App.tsx: Running init() for payments and API keys...");
      try {
        fetch(`${API_BASE}/payments/config`)
          .then(res => res.json())
          .then(data => {
            if (data.keyId) setRzpKeyFromServer(data.keyId);
          })
          .catch(e => console.error("Failed to fetch RZP config", e));

        const aistudio = (window as any).aistudio;
        if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
          const hasKey = await aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          const getEnv = (key: string): string => {
            const env = import.meta.env;
            let val = "";
            if (key === 'VITE_API_KEY') val = env.VITE_API_KEY;
            else if (key === 'API_KEY') val = env.API_KEY;
            else if (key === 'VITE_GEMINI_API_KEY') val = env.VITE_GEMINI_API_KEY;
            else if (key === 'GEMINI_API_KEY') val = env.GEMINI_API_KEY;
            
            if (!val) val = (import.meta as any).env?.[key] || "";
            return (val === "undefined" || val === "null" || val === "your_gemini_api_key_here") ? "" : val;
          };
          const key = getEnv('VITE_API_KEY') || getEnv('API_KEY') || getEnv('VITE_GEMINI_API_KEY') || getEnv('GEMINI_API_KEY');
          setHasApiKey(!!key);
        }
      } catch (e) {
        setHasApiKey(true); 
      }
    };
    init();
    db.fetchPublicVideos().then(setShowcase).catch(e => console.error("Showcase fetch failed", e));

    return () => unsubscribe();
  }, []);

  const refreshUserData = async (uid: string) => {
    try {
      const c = await db.getCredits(uid);
      setCredits(c);
      setTier(await db.getTier(uid));
      const vids = await db.fetchVideos(uid);
      setLibrary(vids);
    } catch (e) {
      console.error("Refresh user data failed", e);
    }
  };

  const handlePayment = (pkg: CreditPackage) => {
    if (!user) { setError(t.login_req); return; }
    
    const rzpKey = rzpKeyFromServer || import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.RAZORPAY_KEY_ID;
    
    // Check if we have a key at all
    if (!rzpKey || rzpKey.includes('your-key-id') || rzpKey === '') {
      setError("Razorpay Key ID missing. Please add RAZORPAY_KEY_ID to the Environment Variables table in AI Studio and reload the page.");
      // Re-fetch config just in case it was added recently
      fetch(`${API_BASE}/payments/config`)
        .then(res => res.json())
        .then(data => {
          if (data.keyId) setRzpKeyFromServer(data.keyId);
        })
        .catch(e => console.error("Failed to re-fetch RZP config", e));
      return;
    }

    const options = {
      key: rzpKey,
      amount: pkg.price * 100,
      currency: pkg.currency,
      name: "Lumina Studio",
      description: `Purchase ${pkg.credits} Credits`,
      image: "https://raw.githubusercontent.com/lucide-react/lucide/main/icons/play.png",
      order_id: "", 
      handler: async (response: any) => {
        if (response.razorpay_payment_id) {
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || "",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || ""
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.status === "success") {
              await db.updateCredits(user.id, pkg.credits, `Purchased ${pkg.name} package`);
              setCredits(prev => prev + pkg.credits);
              setSuccessMsg("Payment Successful! Credits Added.");
              setTimeout(() => setSuccessMsg(null), 4000);
            } else {
              setError(`Payment verification failed: ${verifyData.error || "Invalid signature"}. Please contact support.`);
            }
          } catch (e: any) {
            setError(`Error verifying payment: ${e.message}. Please contact support.`);
          }
        }
      },
      prefill: {
        email: user.email,
        name: user.user_metadata?.full_name || ""
      },
      theme: { color: "#4f46e5" },
      modal: {
        ondismiss: function() {
          console.log("Payment modal closed");
        }
      }
    };

    console.log("Creating Razorpay order for amount:", pkg.price * 100);
    fetch(`${API_BASE}/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: pkg.price * 100, currency: pkg.currency })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        console.error("Server Payment Error:", data);
        throw new Error(data.error || `Server Error (${res.status})`);
      }
      return data;
    })
    .then(order => {
      if (order.id) {
        options.order_id = order.id;
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setError(`Payment Failed: ${response.error.description}. Code: ${response.error.code}`);
        });
        rzp.open();
      } else {
        throw new Error("No order ID returned from server. Check Razorpay configuration.");
      }
    })
    .catch(err => {
      console.error("Payment Flow Error:", err);
      setError(`Payment Error: ${err.message}. Ensure RAZORPAY_SECRET_KEY is set in environment.`);
    });
  };

  const handleGenerate = async (customPrompt?: string, sceneId?: string) => {
    if (authLoading) {
      console.log("Generation blocked: Auth is loading");
      return;
    }
    
    // Check for API Key first to avoid wasting time
    try {
      const aistudio = (window as any).aistudio;
      const hasKey = aistudio && typeof aistudio.hasSelectedApiKey === 'function' ? await aistudio.hasSelectedApiKey() : true;
      if (!hasKey) {
        setShowKeyModal(true);
        return;
      }
    } catch (e) {
      // Ignore if not in AI Studio context
    }

    if (!user) { 
      console.log("Generation blocked: No user found");
      setError(t.login_req); 
      return; 
    }
    if (credits < 10) { 
      console.log("Generation blocked: Low credits", credits);
      setError(t.low_credits); 
      return; 
    }

    // Capture current user state to avoid issues if state changes during long generation
    const currentUserId = user.id;
    const currentPrompt = customPrompt || prompt;
    
    setGenerationTime(0);
    const timer = setInterval(() => {
      setGenerationTime(prev => prev + 1);
    }, 1000);

    if (sceneId) {
      setStoryboard(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'generating' } : s));
    } else {
      setIsGenerating(true);
    }
    
    setStatus("Preparing...");
    console.log("Starting generation for user:", currentUserId);
    
    try {
      const { videoBlob, apiVideoData } = await GeminiVideoService.generateVideo({
        prompt: currentPrompt,
        aspectRatio: selectedAspectRatio,
        resolution: '720p',
        style: selectedStyle.prompt,
        referenceImages: referenceImage ? [referenceImage] : []
      }, (s) => {
        console.log("Generation Status:", s);
        setStatus(s);
      });

      clearInterval(timer);
      setStatus("Saving to Vault...");
      const videoUrl = await db.uploadToStorage(videoBlob, currentUserId);

      let audioUrl = '';
      let directorsNote = '';
      let shortsContent = { caption: '', subtitles: '' };
      
      try {
        const [audio, note, shorts] = await Promise.all([
          GeminiVideoService.generateAudio(currentPrompt),
          GeminiVideoService.generateDirectorsNote(currentPrompt),
          GeminiVideoService.generateShortsContent(currentPrompt)
        ]);
        audioUrl = audio;
        directorsNote = note;
        shortsContent = shorts;
      } catch (e) {
        console.error("Director's Suite generation failed", e);
      }

      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        prompt: currentPrompt,
        url: videoUrl,
        audioUrl: audioUrl,
        directorsNote: directorsNote,
        shortsContent: shortsContent,
        createdAt: Date.now(),
        aspectRatio: selectedAspectRatio,
        resolution: '720p',
        style: selectedStyle.name,
        apiVideoData
      };

      await db.saveVideo(newVideo, currentUserId);
      await db.updateCredits(currentUserId, -10, "Generated Video");
      
      setLibrary(prev => [newVideo, ...prev]);
      setCredits(prev => prev - 10);
      
      if (sceneId) {
        setStoryboard(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'completed', videoUrl, audioUrl, directorsNote, shortsContent } : s));
      } else {
        setPrompt('');
        setCurrentView('library');
      }
      setSuccessMsg("Masterpiece Generated!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error("Generation Error:", e);
      if (e.message === "API_KEY_PENDING") {
        setShowKeyModal(true);
      } else {
        setError(e.message || "Generation failed. Please try again.");
      }
      if (sceneId) {
        setStoryboard(prev => prev.map(s => s.id === sceneId ? { ...s, status: 'pending' } : s));
      }
    } finally {
      setIsGenerating(false);
      setGenerationTime(0);
    }
  };

  const handleSelectKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
        setHasApiKey(true);
      }
      setShowKeyModal(false);
    } catch (e) {
      console.error("Key selection failed", e);
    }
  };

  const handlePlanStoryboard = async () => {
    if (!prompt) return;
    setIsPlanning(true);
    setError(null);
    try {
      const scenes = await GeminiVideoService.planStoryboard(prompt);
      if (scenes && scenes.length > 0) {
        setStoryboard(scenes.map((s, i) => ({ ...s, id: `scene-${i}`, status: 'pending' })));
      } else {
        setError(t.no_scenes);
      }
    } catch (e: any) {
      console.error("Storyboard planning error:", e);
      if (e.message === "API_KEY_PENDING") {
        setShowKeyModal(true);
      } else {
        setError(e.message || t.no_scenes);
      }
    } finally {
      setIsPlanning(false);
    }
  };

  const handleWhatsAppShare = async () => {
    const text = `Check out this amazing AI Video I made with Lumina Studio! Try it here: ${window.location.origin}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    
    if (user) {
      const lastShare = safeStorage.getItem('lumina_last_share');
      const today = new Date().toDateString();
      if (lastShare !== today) {
        await db.updateCredits(user.id, 2, "WhatsApp Share Bonus");
        setCredits(prev => prev + 2);
        safeStorage.setItem('lumina_last_share', today);
        setSuccessMsg("Shared! +2 Credits Added.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }
  };

  const handleExtend = (id: string) => {
    const video = library.find(v => v.id === id);
    if (video) {
      setPrompt(`Extend this video: ${video.prompt}`);
      setCurrentView('generate');
      setSuccessMsg("Prompt loaded for extension!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handlePinReference = (url: string) => {
    setReferenceImage(url);
    setSuccessMsg("Character Reference Pinned!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-red-500/10">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase">Initialization Error</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{initError}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Setup Helper Modal */}
      {showSetupHelper && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[110] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Setup Helper</h2>
                <p className="text-zinc-500 text-xs font-mono mt-1">Copy these URLs to your Dashboards</p>
              </div>
              <button onClick={() => setShowSetupHelper(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Google OAuth / Supabase Site URL</label>
                <div className="flex gap-2 p-1 bg-black/50 border border-white/5 rounded-2xl">
                  <code className="flex-1 px-4 py-3 text-sm font-mono text-zinc-300 truncate">{window.location.origin}</code>
                  <button onClick={() => copyToClipboard(window.location.origin, "Origin URL")} className="px-6 bg-white text-black font-bold rounded-xl text-xs uppercase hover:bg-zinc-200 transition-colors">Copy</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">OAuth Redirect URI (Google/Supabase)</label>
                <div className="flex gap-2 p-1 bg-black/50 border border-white/5 rounded-2xl">
                  <code className="flex-1 px-4 py-3 text-sm font-mono text-zinc-300 truncate">{window.location.origin}/auth/callback</code>
                  <button onClick={() => copyToClipboard(`${window.location.origin}/auth/callback`, "Redirect URI")} className="px-6 bg-white text-black font-bold rounded-xl text-xs uppercase hover:bg-zinc-200 transition-colors">Copy</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Razorpay Webhook URL</label>
                <div className="flex gap-2 p-1 bg-black/50 border border-white/5 rounded-2xl">
                  <code className="flex-1 px-4 py-3 text-sm font-mono text-zinc-300 truncate">{window.location.origin}/api/payments/webhook</code>
                  <button onClick={() => copyToClipboard(`${window.location.origin}/api/payments/webhook`, "Webhook URL")} className="px-6 bg-white text-black font-bold rounded-xl text-xs uppercase hover:bg-zinc-200 transition-colors">Copy</button>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
              <h4 className="text-xs font-bold text-indigo-300 mb-2 uppercase tracking-tight">Pro Tip:</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Google Cloud Console mein hamesha <span className="text-white font-bold">"Web Application"</span> chunein. "Android" ya "iOS" mat chunna, warna wo "Package Name" maangega jo web apps ke liye nahi hota.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        {showKeyModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Cloud Connection Required</h2>
              <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
                To use Google's Veo 3.1 AI models, you must connect your Google Cloud API Key using the button below. 
                <br /><br />
                <span className="text-emerald-400 font-semibold">Note:</span> Even if you added keys to the environment table, Veo requires this manual connection for each session.
              </p>
              <button 
                onClick={handleSelectKey}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 mb-4"
              >
                Connect Google Cloud Key
              </button>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="w-full py-3 bg-transparent hover:bg-white/5 text-zinc-500 font-medium rounded-2xl transition-all"
              >
                Cancel
              </button>
              <p className="mt-6 text-[10px] text-zinc-500 uppercase tracking-widest">
                Stored securely • Never shared
              </p>
            </div>
          </div>
        )}

        <Navbar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          credits={credits} 
          tier={tier} 
          user={user} 
          t={t} 
          onLoginClick={async () => {
            try {
              setError(null);
              await db.signInWithGoogle();
            } catch (e: any) {
              console.error("Login Error:", e);
              setError("Sign in failed: " + (e.message || "Unknown error"));
            }
          }} 
          onLogout={() => db.signOut()} 
          onBuyCredits={() => setCurrentView('pricing')}
          onShare={handleWhatsAppShare}
          onOpenSetup={() => setShowSetupHelper(true)}
          isDemoMode={isDemoMode}
          onAddDemoCredits={addDemoCredits}
        />

        {!db.isConfigured() && user && user.id === 'demo-user-123' && (
          <div className="bg-amber-500/10 border-y border-amber-500/20 px-6 py-2 flex items-center justify-center gap-2">
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
              Demo Mode Active: Connect Supabase for real accounts and cloud storage
            </span>
          </div>
        )}

      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertCircle size={20} />
          <span className="font-bold text-xs uppercase tracking-widest">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 font-black">×</button>
        </div>
      )}

      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Sparkles size={20} />
          <span className="font-black uppercase tracking-widest text-xs">{successMsg}</span>
        </div>
      )}

      {hasApiKey === false && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-[3rem] text-center space-y-6 shadow-2xl">
            <ShieldCheck size={48} className="mx-auto text-indigo-500" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">API Key Required</h2>
            <p className="text-slate-400 text-sm">Veo Video generation requires a paid Google Cloud project API key.</p>
            <button 
              onClick={async () => {
                try {
                  await (window as any).aistudio?.openSelectKey();
                  setHasApiKey(true);
                } catch (e) {
                  console.error("Key selection failed", e);
                }
              }} 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
            >
              Select Project Key
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {currentView === 'generate' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button onClick={toggleLang} className="px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center gap-2">
                  <Languages size={14} /> {t.lang_toggle}
                </button>
                <button onClick={() => { setIsStoryMode(!isStoryMode); setStoryboard([]); }} className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase transition-all flex items-center gap-2 ${isStoryMode ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400'}`}>
                  <CreditCard size={14} /> {isStoryMode ? t.story_mode : t.switch_story}
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4 justify-center">
                <h1 className="text-5xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 uppercase leading-none">{t.hero}</h1>
                <div className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center gap-2 self-center md:self-end mb-2 animate-pulse">
                  <Sparkles size={12} className="text-indigo-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">{t.director_suite}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-6 md:p-12 shadow-2xl backdrop-blur-3xl relative">
              <div className="relative mb-8">
                <textarea 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder={isStoryMode ? t.story_placeholder : t.placeholder} 
                  className="w-full h-48 bg-slate-950/80 border border-slate-800 rounded-[2.5rem] p-8 text-lg outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-slate-800" 
                />
                {!isStoryMode && (
                  <button onClick={async () => { setIsRefining(true); setPrompt(await GeminiVideoService.refinePrompt(prompt)); setIsRefining(false); }} className="absolute bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-xl disabled:opacity-50">
                    {isRefining ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                  </button>
                )}
              </div>

              {isStoryMode && storyboard.length === 0 && (
                <button onClick={handlePlanStoryboard} disabled={isPlanning || !prompt} className="w-full mb-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                  {isPlanning ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} {isPlanning ? t.planning : t.plan_story}
                </button>
              )}

              {isStoryMode && storyboard.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {storyboard.map((scene, idx) => (
                    <div key={scene.id} className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t.scene} 0{idx + 1}</span>
                        <span className="text-[8px] px-2 py-1 bg-slate-900 rounded-lg text-slate-500 font-bold uppercase">{scene.shotType}</span>
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight">{scene.title}</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">{scene.prompt}</p>
                      
                      <div className="pt-4 flex items-center gap-2">
                        {scene.status === 'completed' ? (
                          <div className="flex flex-col gap-2 w-full">
                            <video src={scene.videoUrl} className="w-full aspect-video rounded-xl bg-black object-cover" controls />
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                <CheckCircle2 size={10} /> {t.audio_gen}
                              </span>
                              <button onClick={() => { setPrompt(scene.prompt); setIsStoryMode(false); }} className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Edit Scene</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleGenerate(scene.prompt, scene.id)}
                            disabled={isGenerating || scene.status === 'generating'}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                          >
                            {scene.status === 'generating' ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                            {scene.status === 'generating' ? t.rendering : t.gen_scene}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isStoryMode && (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Cinematic Styles</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {STYLES.map((style) => (
                        <button 
                          key={style.id} 
                          onClick={() => setSelectedStyle(style)} 
                          className={`relative group overflow-hidden rounded-2xl aspect-[4/5] transition-all border-2 ${selectedStyle.id === style.id ? 'border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                          <img src={style.image} alt={style.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-4">
                            <span className="text-[10px] font-black uppercase tracking-widest">{style.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Aspect Ratio</h3>
                      <div className="flex gap-4">
                        {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                          <button 
                            key={ratio} 
                            onClick={() => setSelectedAspectRatio(ratio)} 
                            className={`flex-1 py-4 rounded-2xl border font-black text-xs transition-all ${selectedAspectRatio === ratio ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Character Reference</h3>
                      <label className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${referenceImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        {referenceImage ? (
                          <div className="flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase text-emerald-400">Image Locked</span>
                            <button onClick={(e) => { e.preventDefault(); setReferenceImage(null); }} className="text-slate-500 hover:text-red-500 ml-2">×</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <ShieldCheck size={16} className="text-slate-500" />
                            <span className="text-[10px] font-black uppercase text-slate-500">Upload Reference</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleGenerate()} 
                    disabled={isGenerating || !prompt} 
                    className="w-full py-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center justify-center gap-4">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
                        {isGenerating ? status : t.generate_btn}
                      </div>
                      {isGenerating && (
                        <div className="text-[10px] font-mono text-indigo-300/60 uppercase tracking-widest mt-2">
                          Time Elapsed: {Math.floor(generationTime / 60)}:{(generationTime % 60).toString().padStart(2, '0')} • Usually takes 2-5 mins
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'library' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tighter uppercase">{t.vault}</h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => user && refreshUserData(user.id)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500/10 transition-all"
                >
                  Refresh
                </button>
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase text-slate-500">
                  {library.length} Videos
                </div>
              </div>
            </div>
            
            {library.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                  <Loader2 className="text-slate-800" size={32} />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">{t.no_vids}</p>
                <button onClick={() => setCurrentView('generate')} className="px-8 py-4 bg-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all">Start Creating</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {library.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  t={t}
                  onDelete={async (id) => {
                    await db.deleteVideo(id);
                    setLibrary(prev => prev.filter(v => v.id !== id));
                  }}
                  onExtend={handleExtend}
                  onPinReference={handlePinReference}
                  onTogglePublic={async (id, isPublic) => {
                    await db.updateVideoPrivacy(id, isPublic);
                    setLibrary(prev => prev.map(v => v.id === id ? { ...v, isPublic } : v));
                  }}
                  setSuccessMsg={setSuccessMsg}
                />
              ))}
            </div>
            )}
          </div>
        )}

        {currentView === 'explore' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-black tracking-tighter uppercase">{t.explore}</h2>
              <p className="text-slate-500 font-medium tracking-widest uppercase text-[10px]">Curated masterpieces from the Lumina community</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {showcase.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  t={t}
                  isExplore 
                  onDelete={() => {}} 
                  onExtend={handleExtend}
                  onPinReference={handlePinReference}
                  setSuccessMsg={setSuccessMsg}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'pricing' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
            <div className="text-center space-y-4">
              <h2 className="text-7xl font-black tracking-tighter uppercase">Fuel Your Vision</h2>
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">{t.choose_plan}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {PACKAGES.map((pkg) => (
                <div key={pkg.id} className={`relative bg-slate-900/40 border rounded-[3rem] p-10 flex flex-col gap-8 transition-all hover:scale-105 ${pkg.recommended ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20' : 'border-slate-800'}`}>
                  {pkg.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest">Recommended</div>
                  )}
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tight">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">₹{pkg.price}</span>
                      <span className="text-slate-500 text-[10px] font-black uppercase">/ One-time</span>
                    </div>
                  </div>
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Zap size={16} />
                      <span className="text-sm font-black uppercase tracking-widest">{pkg.credits} Credits</span>
                    </div>
                    <ul className="space-y-3">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs text-slate-400">
                          <CheckCircle2 size={14} className="text-slate-700" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={() => handlePayment(pkg)}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${pkg.recommended ? 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
                  >
                    {t.select_plan}
                  </button>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto bg-slate-900/20 border border-slate-800/50 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                  <Share2 className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tight text-sm">{t.share_bonus}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Help us grow and get rewarded</p>
                </div>
              </div>
              <button onClick={handleWhatsAppShare} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Share on WhatsApp</button>
            </div>
          </div>
        )}

        {currentView === 'terms' && <LegalPages type="terms" onBack={() => setCurrentView('generate')} />}
        {currentView === 'privacy' && <LegalPages type="privacy" onBack={() => setCurrentView('generate')} />}
        {currentView === 'refund' && <LegalPages type="refund" onBack={() => setCurrentView('generate')} />}
      </main>

      <footer className="border-t border-slate-900 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tighter uppercase">LUMINA</h3>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-loose">The next generation of cinematic AI video production. Powered by Google Veo.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-slate-900 rounded-lg border border-slate-800" />
              <div className="w-8 h-8 bg-slate-900 rounded-lg border border-slate-800" />
              <div className="w-8 h-8 bg-slate-900 rounded-lg border border-slate-800" />
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Platform</h4>
            <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <li><button onClick={() => setCurrentView('generate')} className="hover:text-indigo-400 transition-colors">Create</button></li>
              <li><button onClick={() => setCurrentView('explore')} className="hover:text-indigo-400 transition-colors">Showcase</button></li>
              <li><button onClick={() => setCurrentView('pricing')} className="hover:text-indigo-400 transition-colors">Pricing</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Legal</h4>
            <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <li><button onClick={() => setCurrentView('terms')} className="hover:text-indigo-400 transition-colors">{t.terms}</button></li>
              <li><button onClick={() => setCurrentView('privacy')} className="hover:text-indigo-400 transition-colors">{t.privacy}</button></li>
              <li><button onClick={() => setCurrentView('refund')} className="hover:text-indigo-400 transition-colors">{t.refund}</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t.sys_status}</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Server</span>
                <span className="flex items-center gap-2 text-[8px] font-black uppercase text-emerald-500">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {t.connected}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Veo API</span>
                <span className={`flex items-center gap-2 text-[8px] font-black uppercase ${hasApiKey ? 'text-emerald-500' : 'text-amber-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} /> {hasApiKey ? t.api_ready : t.api_pending}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-12 border-t border-slate-900 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-700">© 2024 LUMINA AI VIDEO PRO. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  </div>
  );
};

export default App;
