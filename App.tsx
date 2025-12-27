
import React, { useState } from 'react';
import Layout from './components/Layout.tsx';
import ChatBot from './components/ChatBot.tsx';
import QuizGame from './components/QuizGame.tsx';
import SecurityTools from './components/SecurityTools.tsx';
import MiniGames from './components/MiniGames.tsx';
import VideoLab from './components/VideoLab.tsx';
import AttackSimulator from './components/AttackSimulator.tsx';
import { AppTab } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [isSystemCompromised, setIsSystemCompromised] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return (
          <div className="space-y-16 py-8 animate-in fade-in duration-700">
            <section className="text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
                DEVENEZ UN <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">CYBER-DÉFENSEUR</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                Apprenez à protéger vos données, débusquez les arnaques et testez vos réflexes face aux menaces numériques réelles.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button onClick={() => setActiveTab(AppTab.SIMULATOR)} className="bg-red-500 hover:bg-red-600 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(239,68,68,0.6)] uppercase tracking-widest">
                  Tester les Attaques
                </button>
                <button onClick={() => setActiveTab(AppTab.GAMES)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)] uppercase tracking-widest">
                  Mini-Jeux
                </button>
              </div>
            </section>

            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { tab: AppTab.SIMULATOR, icon: '☣️', title: 'Hacker Sandbox', desc: 'Simulez des SQLi, XSS et Brute Force pour comprendre le danger.' },
                { tab: AppTab.CHAT, icon: '🎓', title: 'Assistant IA', desc: 'Discutez avec une intelligence experte pour comprendre la sécurité.' },
                { tab: AppTab.QUIZ, icon: '❓', title: 'Quiz Mastery', desc: 'Testez vos connaissances sur des scénarios de menaces réels.' },
                { tab: AppTab.TOOLS, icon: '🛡️', title: 'Audit Tool', desc: 'Analysez vos liens, mails et la robustesse de vos mots de passe.' }
              ].map((card, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveTab(card.tab)}
                  className="glass p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer hover:translate-y-[-4px] shadow-xl"
                >
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-left">{card.icon}</div>
                  <h3 className="text-xl font-black mb-3 text-white uppercase tracking-tight">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </section>
          </div>
        );
      case AppTab.CHAT: return <ChatBot isCompromised={isSystemCompromised} />;
      case AppTab.QUIZ: return <QuizGame />;
      case AppTab.GAMES: return <MiniGames />;
      case AppTab.TOOLS: return <SecurityTools />;
      case AppTab.VIDEO_LAB: return <VideoLab />;
      case AppTab.SIMULATOR: return <AttackSimulator onCompromise={setIsSystemCompromised} />;
      case AppTab.ABOUT:
        return (
          <div className="max-w-3xl mx-auto space-y-8 glass p-12 rounded-[3rem] border border-slate-800 animate-in zoom-in duration-500">
            <h2 className="text-4xl font-black text-emerald-400 uppercase tracking-tighter">CyberShield AI</h2>
            <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
              <p>CyberShield AI est une plateforme éducative conçue pour transformer la sensibilisation à la cybersécurité en une expérience immersive.</p>
              <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
                <h4 className="font-black text-white uppercase tracking-widest text-sm text-emerald-500">Technologies embarquées :</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
                  <li className="flex items-center space-x-2"><span>✅</span> <span>Gemini 3 Pro (Raisonnement)</span></li>
                  <li className="flex items-center space-x-2"><span>✅</span> <span>Veo 3.1 (Simulation Vidéo)</span></li>
                  <li className="flex items-center space-x-2"><span>✅</span> <span>Analyse Forensique Locale</span></li>
                  <li className="flex items-center space-x-2"><span>✅</span> <span>Sandbox d'Attaque (SQLi, XSS)</span></li>
                </ul>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
