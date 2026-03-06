import React, { useState } from 'react';
import { 
  Play, Download, Trash2, Share2, Music, MessageSquare, 
  Maximize2, Globe, Lock, Sparkles, Wand2, Type
} from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoCardProps {
  video: GeneratedVideo;
  t: any;
  setSuccessMsg?: (msg: string) => void;
  isExplore?: boolean;
  onDelete: (id: string) => void;
  onExtend: (id: string) => void;
  onPinReference: (url: string) => void;
  onTogglePublic?: (id: string, val: boolean) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  t,
  setSuccessMsg,
  isExplore,
  onDelete,
  onExtend,
  onPinReference,
  onTogglePublic
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShorts, setShowShorts] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumina_${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMsg?.("Download Started!");
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const handleShare = () => {
    const text = `Check out this AI video I made with Lumina: ${video.url}`;
    navigator.clipboard.writeText(text);
    setSuccessMsg?.("Link Copied to Clipboard!");
  };

  return (
    <div className="group bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl hover:border-indigo-500/30 transition-all duration-500">
      <div className="relative aspect-video bg-slate-950 overflow-hidden">
        <video 
          src={video.url} 
          className="w-full h-full object-cover"
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
          muted
          loop
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button 
            onClick={() => setIsPlaying(true)}
            className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"
          >
            <Play size={24} fill="currentColor" />
          </button>
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-white border border-white/10">
            {video.aspectRatio}
          </span>
          <span className="px-2 py-1 bg-indigo-600/80 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-white border border-indigo-400/20">
            {video.style}
          </span>
        </div>

        {!isExplore && onTogglePublic && (
          <button 
            onClick={() => onTogglePublic(video.id, !video.isPublic)}
            className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md border transition-all ${video.isPublic ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-900/60 border-slate-700 text-slate-400'}`}
          >
            {video.isPublic ? <Globe size={14} /> : <Lock size={14} />}
          </button>
        )}
      </div>

      <div className="p-6 space-y-4 flex-grow flex flex-col">
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Prompt</p>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed italic">"{video.prompt}"</p>
        </div>

        {video.directorsNote && (
          <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-indigo-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">{t.directors_note}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">"{video.directorsNote}"</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 mt-auto">
          <button 
            onClick={handleDownload}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Download size={12} /> Save
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={12} /> Share
          </button>
          
          {!isExplore && (
            <button 
              onClick={() => onDelete(video.id)}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {video.shortsContent && (
          <button 
            onClick={() => setShowShorts(!showShorts)}
            className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-[8px] font-black uppercase tracking-widest text-indigo-400 transition-all flex items-center justify-center gap-2"
          >
            <Type size={12} /> Viral Shorts Content
          </button>
        )}

        {showShorts && video.shortsContent && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Caption</p>
              <p className="text-[10px] text-slate-300">{video.shortsContent.caption}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Subtitles</p>
              <p className="text-[10px] text-slate-400 italic">{video.shortsContent.subtitles}</p>
            </div>
          </div>
        )}
      </div>

      {isPlaying && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-3xl" onClick={() => setIsPlaying(false)}>
          <div className="max-w-5xl w-full aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <video src={video.url} className="w-full h-full" controls autoPlay />
            <button 
              onClick={() => setIsPlaying(false)}
              className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
            >
              <Maximize2 size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
