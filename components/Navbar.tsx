import React from 'react';
import { Sparkles, CreditCard, Share2, LogOut, LogIn, Menu, Zap } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  credits: number;
  tier: string;
  user: any;
  t: any;
  onLoginClick: () => void;
  onLogout: () => void;
  onBuyCredits: () => void;
  onShare: () => void;
  onOpenSetup: () => void;
  isDemoMode?: boolean;
  onAddDemoCredits?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  credits,
  tier,
  user,
  t,
  onLoginClick,
  onLogout,
  onBuyCredits,
  onShare,
  onOpenSetup,
  isDemoMode,
  onAddDemoCredits
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate('generate')}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Lumina</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => onNavigate('generate')}
              className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'generate' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
            >
              Generate
            </button>
            <button 
              onClick={() => onNavigate('library')}
              className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'library' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
            >
              {t.vault}
            </button>
            <button 
              onClick={() => onNavigate('explore')}
              className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'explore' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
            >
              {t.explore}
            </button>
            <button 
              onClick={onOpenSetup}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-all flex items-center gap-1"
            >
              Setup
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black text-white">{credits}</span>
                </div>
                <div className="w-[1px] h-3 bg-slate-800" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{tier}</span>
              </div>
              
              <button 
                onClick={onBuyCredits}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <Zap size={16} />
              </button>

              {isDemoMode && onAddDemoCredits && (
                <button 
                  onClick={onAddDemoCredits}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-600/30 transition-all"
                >
                  <Sparkles size={12} /> +50 Credits
                </button>
              )}

              <div className="flex items-center gap-3 pl-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                  <img 
                    src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-red-400 transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={onLoginClick}
              className="px-6 py-2.5 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
