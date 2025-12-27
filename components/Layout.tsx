
import React from 'react';
import { AppTab } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: AppTab.HOME, label: 'Accueil', icon: '🏠' },
    { id: AppTab.CHAT, label: 'Assistant', icon: '🤖' },
    { id: AppTab.QUIZ, label: 'Quiz', icon: '❓' },
    { id: AppTab.GAMES, label: 'Jeux', icon: '🎮' },
    { id: AppTab.SIMULATOR, label: 'Sandbox', icon: '☣️' },
    { id: AppTab.TOOLS, label: 'Diagnostic', icon: '🛡️' },
    { id: AppTab.VIDEO_LAB, label: 'Cyber Lab', icon: '🎬' },
    { id: AppTab.ABOUT, label: 'Infos', icon: 'ℹ️' },
  ];

  return (
    <div className="flex flex-col min-h-screen cyber-grid bg-slate-950">
      <header className="sticky top-0 z-50 glass border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(AppTab.HOME)}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20">CS</div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-tighter">
            CyberShield AI
          </h1>
        </div>
        <nav className="hidden lg:flex space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 font-bold text-sm ${
                activeTab === tab.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner' 
                : 'text-slate-400 hover:text-emerald-300 hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="uppercase tracking-widest text-[10px]">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        {children}
      </main>

      <footer className="lg:hidden sticky bottom-0 glass border-t border-emerald-500/20 flex justify-around p-3 backdrop-blur-xl z-50">
        {tabs.slice(0, 6).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              activeTab === tab.id ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-[8px] uppercase font-black tracking-tighter mt-1">{tab.label}</span>
          </button>
        ))}
      </footer>
    </div>
  );
};

export default Layout;
