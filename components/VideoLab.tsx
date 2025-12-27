
import React, { useState, useRef, useEffect } from 'react';
import { generateVideo } from '../services/geminiService.ts';

// --- LAB AUDIO ENGINE ---
class LabAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  playStartGen() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playSuccess() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx!.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0.04, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.4);
    });
  }
}

const labAudio = new LabAudio();

const VideoLab: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<{ title: string; message: string; action?: () => void; link?: { text: string; url: string } } | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    labAudio.setMute(isMuted);
  }, [isMuted]);

  const loadingMessages = [
    "Initialisation du moteur Veo...",
    "Analyse de la structure de l'image...",
    "Génération des frames d'animation...",
    "Rendu haute fidélité en cours...",
    "Finalisation de la vidéo cyber...",
    "Synchronisation des couches de sécurité..."
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;

    try {
      labAudio.playStartGen();
      setIsGenerating(true);
      setError(null);
      setVideoUrl(null);
      
      const isKeySelected = await (window as any).aistudio.hasSelectedApiKey();
      if (!isKeySelected) {
        await (window as any).aistudio.openSelectKey();
      }

      let msgIndex = 0;
      const interval = setInterval(() => {
        setLoadingMsg(loadingMessages[msgIndex % loadingMessages.length]);
        msgIndex++;
      }, 5000);

      const url = await generateVideo(image, prompt, aspectRatio);
      setVideoUrl(url);
      labAudio.playSuccess();
      clearInterval(interval);
    } catch (err: any) {
      console.error("Video Generation Error:", err);
      const errString = err?.message || String(err);
      
      if (errString.includes("Requested entity was not found")) {
        setError({
          title: "Configuration Requise",
          message: "La clé API sélectionnée n'a pas accès au modèle Veo. Utilisez une clé liée à un projet avec facturation active.",
          action: () => (window as any).aistudio.openSelectKey(),
          link: { text: "Documentation Facturation", url: "https://ai.google.dev/gemini-api/docs/billing" }
        });
      } else {
        setError({
          title: "Échec de Génération",
          message: "Une erreur technique est survenue durant le rendu. Vérifiez votre quota ou essayez avec une autre image.",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto relative">
      <div className="absolute -top-4 right-0 flex items-center space-x-2">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{isMuted ? 'Silencieux' : 'Audio Lab'}</span>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-full border transition-all ${isMuted ? 'border-slate-800 text-slate-600' : 'border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'}`}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">Cyber Lab d'Animation</h2>
        <p className="text-slate-400">Générez des visuels de sécurité cinématiques avec Veo 3.1.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-emerald-500/20 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-black text-emerald-400 uppercase tracking-widest">1. Charger l'image</label>
            <div 
              className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${image ? 'border-emerald-500/50' : 'border-slate-700 hover:border-emerald-500/30'}`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {image ? (
                <img src={image} className="w-full h-full object-cover" alt="Source" />
              ) : (
                <>
                  <span className="text-4xl mb-2">📸</span>
                  <span className="text-xs text-slate-500 uppercase font-bold">Cliquer pour uploader</span>
                </>
              )}
              <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-black text-emerald-400 uppercase tracking-widest">2. Instructions</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Glitch numérique, reflets néons..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 h-24 resize-none text-white"
            />
          </div>

          <button 
            disabled={!image || isGenerating}
            onClick={handleGenerate}
            className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {isGenerating ? 'GÉNÉRATION...' : 'ANIMER L\'IMAGE'}
          </button>
        </div>

        <div className="glass p-8 rounded-3xl border border-cyan-500/20 flex flex-col min-h-[400px]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
             <span className="mr-2 text-2xl">📽️</span> Preview
          </h3>
          <div className="flex-grow flex items-center justify-center relative bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            {isGenerating ? (
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                <p className="text-emerald-400 font-bold animate-pulse">{loadingMsg}</p>
              </div>
            ) : videoUrl ? (
              <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-lg shadow-2xl" />
            ) : error ? (
              <div className="text-center p-8 space-y-4 max-w-sm">
                <div className="text-red-400 font-black uppercase text-sm tracking-widest">{error.title}</div>
                <p className="text-slate-400 text-xs">{error.message}</p>
                {error.action && <button onClick={error.action} className="bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold">CONFIGURER CLÉ</button>}
              </div>
            ) : (
              <p className="text-slate-600 text-sm uppercase tracking-widest">En attente de rendu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLab;
