
import React, { useState, useEffect, useRef } from 'react';

type GameType = 'HUB' | 'PHISH_HUNT' | 'FIREWALL_DEFENSE' | 'PASSWORD_HERO' | 'ACCOUNT_HIJACK' | 'SOCIAL_ENGINEERING';

interface GameScenario {
  id: number;
  type: string;
  title: string;
  threat: string;
  options: { text: string; isCorrect: boolean; feedback: string }[];
}

const HIJACK_SCENARIOS: GameScenario[] = [
  {
    id: 1,
    type: 'DATA_BREACH',
    title: 'Fuite de Données Massive',
    threat: "Une base de données d'un site que vous utilisez a été publiée sur le Dark Web. Votre mot de passe habituel est maintenant public.",
    options: [
      { text: "Changer uniquement le mot de passe du site concerné", isCorrect: false, feedback: "Insuffisant ! Si vous réutilisez ce mot de passe ailleurs, tous vos comptes sont en danger." },
      { text: "Changer tous les comptes utilisant ce MDP + Activer la 2FA", isCorrect: true, feedback: "Parfait ! C'est la seule façon de bloquer un attaquant qui possède déjà vos identifiants." },
      { text: "Ignorer tant que je n'ai pas d'alerte de connexion", isCorrect: false, feedback: "Trop tard ! Les hackers utilisent des bots pour tester vos accès en quelques secondes." }
    ]
  },
  {
    id: 2,
    type: 'RECOVERY_ATTACK',
    title: 'Détournement de Récupération',
    threat: "Vous recevez un code de réinitialisation de mot de passe par SMS que vous n'avez pas demandé. Juste après, un 'ami' vous demande ce code par message.",
    options: [
      { text: "Lui donner le code pour l'aider", isCorrect: false, feedback: "ERREUR FATALE ! C'est une attaque par détournement de compte. Ne partagez JAMAIS un code de sécurité." },
      { text: "Supprimer le SMS et bloquer l'ami (compte piraté)", isCorrect: true, feedback: "Bien vu ! Le compte de votre ami a probablement été piraté pour vous cibler." },
      { text: "Cliquer sur le lien 'Ce n'était pas moi' dans le SMS", isCorrect: false, feedback: "Prudence. Le SMS lui-même pourrait être un faux (smishing) conçu pour vous voler vos accès." }
    ]
  },
  {
    id: 3,
    type: 'SESSION_HIJACK',
    title: 'Vol de Session (Cookie)',
    threat: "Vous avez utilisé un ordinateur public et oublié de vous déconnecter. Un attaquant récupère votre session active via les cookies du navigateur.",
    options: [
      { text: "Attendre que la session expire d'elle-même", isCorrect: false, feedback: "Trop risqué. L'attaquant peut modifier vos informations de sécurité avant l'expiration." },
      { text: "Se connecter depuis mon mobile et 'Déconnecter tous les appareils'", isCorrect: true, feedback: "Excellent ! Révoquer les sessions actives est le premier réflexe en cas d'oubli ou de vol." },
      { text: "Changer juste le mot de passe", isCorrect: false, feedback: "Pas assez. Changer le MDP ne déconnecte pas forcément une session déjà ouverte via un cookie." }
    ]
  }
];

const SOCIAL_SCENARIOS: GameScenario[] = [
  {
    id: 1,
    type: 'SMS',
    title: 'Alerte Livraison',
    threat: "Votre colis n°FR9382 est bloqué en raison de frais de douane impayés (1.99€). Veuillez régulariser la situation ici : http://suivi-douane-france.net",
    options: [
      { text: "Cliquer sur le lien pour payer", isCorrect: false, feedback: "C'est une attaque de SMISHING. Les services postaux n'utilisent jamais de domaines suspects pour des paiements." },
      { text: "Vérifier sur le site officiel de la Poste via mon navigateur", isCorrect: true, feedback: "Excellent réflexe ! Ne cliquez jamais sur un lien de paiement reçu par SMS." },
      { text: "Répondre au SMS pour demander des détails", isCorrect: false, feedback: "Mauvaise idée. Cela confirme que votre numéro est actif et vous expose à plus de spam." }
    ]
  },
  {
    id: 2,
    type: 'APPEL',
    title: 'Support Technique Microsoft',
    threat: "Bonjour, je suis Jean du support Microsoft. Nous avons détecté une infection grave sur votre ordinateur qui propage des virus sur notre réseau. Je dois prendre la main à distance via AnyDesk immédiatement.",
    options: [
      { text: "Installer AnyDesk pour qu'il répare mon PC", isCorrect: false, feedback: "C'est du VISHING. Microsoft ne vous appellera jamais de manière proactive pour un problème technique." },
      { text: "Raccrocher immédiatement", isCorrect: true, feedback: "Parfait. C'est la seule réponse sûre face à une tentative d'arnaque au support technique." },
      { text: "Lui demander son numéro de badge employé", isCorrect: false, feedback: "Inutile. Les escrocs ont des scripts préparés et inventeront de faux détails crédibles." }
    ]
  },
  {
    id: 3,
    type: 'EMAIL',
    title: 'Urgence RH',
    threat: "Bonjour, suite à une erreur dans le calcul des paies ce mois-ci, vous devez valider vos coordonnées bancaires avant 17h pour recevoir votre virement. Document joint : RIB_MAJ.exe",
    options: [
      { text: "Ouvrir la pièce jointe pour vérifier mon RIB", isCorrect: false, feedback: "Danger ! Un fichier .exe envoyé par les 'RH' est presque certainement un malware." },
      { text: "Vérifier l'adresse de l'expéditeur et appeler les RH", isCorrect: true, feedback: "Très bien ! L'adresse finit par @outlook.fr au lieu du domaine de l'entreprise (@corpo.com)." },
      { text: "Transférer l'email à mes collègues pour les prévenir", isCorrect: false, feedback: "Prudent, mais dangereux. Vous risquez de propager le malware s'ils l'ouvrent par mégarde." }
    ]
  }
];

const TUTORIALS: Record<GameType, { icon: string, title: string, steps: string[] }> = {
  HUB: { icon: '🎮', title: 'Hub de Jeux', steps: [] },
  PHISH_HUNT: {
    icon: '🎣',
    title: 'Tutoriel : Phish Hunt',
    steps: [
      "Analysez l'adresse de l'expéditeur (méfiez-vous des domaines gratuits ou mal orthographiés).",
      "Survolez les liens avant de cliquer pour voir l'URL de destination réelle.",
      "Identifiez le ton urgent ou alarmiste souvent utilisé pour vous pousser à l'erreur.",
      "Signalez les emails suspects plutôt que de les supprimer simplement."
    ]
  },
  FIREWALL_DEFENSE: {
    icon: '🛡️',
    title: 'Tutoriel : Firewall Flow',
    steps: [
      "Les paquets VERTS représentent les données légitimes : laissez-les passer.",
      "Les paquets ROUGES sont des menaces (malwares, scans) : cliquez pour les bloquer.",
      "Plus la vitesse augmente, plus les attaques sont sophistiquées.",
      "Ne laissez pas plus de 3 menaces pénétrer le réseau !"
    ]
  },
  PASSWORD_HERO: {
    icon: '🔐',
    title: 'Tutoriel : Password Hero',
    steps: [
      "La force d'un mot de passe dépend de son entropie (complexité + longueur).",
      "Mélangez majuscules, minuscules, chiffres et symboles.",
      "Évitez les mots du dictionnaire ou les dates de naissance.",
      "Utilisez une phrase secrète longue pour une sécurité maximale."
    ]
  },
  SOCIAL_ENGINEERING: {
    icon: '🧠',
    title: 'Tutoriel : Social Engineer',
    steps: [
      "Les cyber-attaquants jouent sur vos émotions (peur, curiosité, urgence).",
      "Ne donnez JAMAIS d'informations confidentielles par SMS ou appel entrant.",
      "Vérifiez l'identité de l'interlocuteur par un canal officiel différent.",
      "Méfiez-vous des offres 'trop belles pour être vraies'."
    ]
  },
  ACCOUNT_HIJACK: {
    icon: '🚨',
    title: 'Tutoriel : Account Hijack',
    steps: [
      "Si votre compte est compromis, changez immédiatement tous vos mots de passe.",
      "Activez l'authentification à deux facteurs (2FA) sur tous vos services.",
      "Vérifiez les appareils connectés et déconnectez les sessions suspectes.",
      "Révoquez les permissions des applications tierces inconnues."
    ]
  }
};

// --- SYNERGIC CYBER AUDIO ENGINE ---
class CyberAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) { this.isMuted = mute; }

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.1);
      g.gain.setValueAtTime(0.04, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.4);
    });
  }

  playVictoryHero() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Fanfare d'accords majeurs triomphale (C Major Arpeggio with Square waves)
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t + i * 0.08);
      g.gain.setValueAtTime(0.04, t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.6);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.6);
    });
  }

  playDefeatHero() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Son dramatique de rupture (Glissando descendant discordant + Bruit blanc)
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.2);
    
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(30, t);
    lfoGain.gain.setValueAtTime(20, t);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    
    osc.connect(g);
    g.connect(this.ctx.destination);
    
    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 1.2);
    osc.stop(t + 1.2);
  }

  playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.3);
    g.gain.setValueAtTime(0.05, t);
    g.gain.linearRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.3);
  }

  playPopup() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
    g.gain.setValueAtTime(0.02, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.1);
  }

  playInput() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    g.gain.setValueAtTime(0.01, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.05);
  }
}

const audio = new CyberAudio();

const TutorialModal: React.FC<{ tutorial: { icon: string, title: string, steps: string[] }, onClose: () => void }> = ({ tutorial, onClose }) => {
  useEffect(() => {
    audio.playPopup();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass max-w-lg w-full p-8 rounded-[2.5rem] border border-emerald-500/30 shadow-2xl space-y-6 relative animate-in zoom-in duration-300">
        <button 
          onClick={() => { audio.playClick(); onClose(); }}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          ✕
        </button>
        <div className="text-center space-y-4">
          <div className="text-6xl">{tutorial.icon}</div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{tutorial.title}</h3>
        </div>
        <div className="space-y-4">
          {tutorial.steps.map((step, i) => (
            <div key={i} className="flex items-start space-x-3 bg-slate-900/50 p-4 rounded-xl border border-white/5 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="text-emerald-500 font-bold">{i + 1}.</span>
              <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
        <button 
          onClick={() => { audio.playClick(); onClose(); }}
          className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-xl uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
        >
          Compris !
        </button>
      </div>
    </div>
  );
};

const GameHeader: React.FC<{ onBack: () => void, onReset: () => void, onTutorial: () => void, title: string }> = ({ onBack, onReset, onTutorial, title }) => (
  <div className="flex flex-wrap gap-4 justify-between items-center px-6 py-4 bg-slate-900/80 rounded-2xl border border-white/5 mb-8 shadow-xl">
    <button onClick={() => { audio.playClick(); onBack(); }} className="text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center">
      <span className="mr-2">←</span> Hub central
    </button>
    <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
    <div className="flex items-center space-x-2">
      <button 
        onClick={() => { audio.playClick(); onTutorial(); }}
        className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
      >
        Tutoriel 📖
      </button>
      <button 
        onClick={() => { audio.playClick(); onReset(); }} 
        className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
      >
        Reset 🔄
      </button>
    </div>
  </div>
);

const MiniGames: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('HUB');
  const [score, setScore] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // State for Scenario-based Games (Social & Hijack)
  const [scenarioStep, setScenarioStep] = useState(0);
  const [scenarioFeedback, setScenarioFeedback] = useState<string | null>(null);
  const [isGameFinished, setIsGameFinished] = useState(false);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setScore(0);
    setScenarioStep(0);
    setScenarioFeedback(null);
    setIsGameFinished(false);
    setPasswordInput('');
    audio.playPopup();
  };

  const selectGame = (game: GameType) => {
    audio.playClick();
    setCurrentGame(game);
    setShowTutorial(true); 
  };

  const checkPasswordHero = () => {
    if (passwordInput.length > 12 && /[!@#$%^&*]/.test(passwordInput)) {
      audio.playVictoryHero();
      setScore(prev => prev + 500);
      setIsGameFinished(true);
    } else {
      audio.playDefeatHero();
    }
  };

  const handleScenarioChoice = (option: { text: string; isCorrect: boolean; feedback: string }, scenarios: GameScenario[]) => {
    if (scenarioFeedback) return;
    
    setScenarioFeedback(option.feedback);
    if (option.isCorrect) {
      setScore(prev => prev + 100);
      audio.playSuccess();
    } else {
      audio.playError();
    }

    setTimeout(() => {
      if (scenarioStep + 1 < scenarios.length) {
        setScenarioStep(prev => prev + 1);
        setScenarioFeedback(null);
        audio.playInput();
      } else {
        setIsGameFinished(true);
        if (score >= scenarios.length * 70) {
          audio.playVictoryHero();
        } else {
          audio.playDefeatHero();
        }
      }
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showTutorial && currentGame !== 'HUB' && (
        <TutorialModal 
          tutorial={TUTORIALS[currentGame]} 
          onClose={() => setShowTutorial(false)} 
        />
      )}

      {currentGame === 'HUB' ? (
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-3">Zone d'Entraînement</h2>
            <p className="text-slate-400">Pratiquez vos réflexes face aux cyber-attaques les plus courantes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'PHISH_HUNT', icon: '🎣', title: 'Phish Hunt', color: 'emerald', desc: 'Débusquez les emails frauduleux.' },
              { id: 'FIREWALL_DEFENSE', icon: '🛡️', title: 'Firewall Flow', color: 'cyan', desc: 'Bloquez les paquets malveillants.' },
              { id: 'PASSWORD_HERO', icon: '🔐', title: 'Password Hero', color: 'purple', desc: 'Créez des coffres incassables.' },
              { id: 'SOCIAL_ENGINEERING', icon: '🧠', title: 'Social Engineer', color: 'pink', desc: 'Déjouez les manipulateurs psychologiques.' },
              { id: 'ACCOUNT_HIJACK', icon: '🚨', title: 'Account Hijack', color: 'orange', desc: 'Reprenez le contrôle.' }
            ].map(game => (
              <div 
                key={game.id}
                onClick={() => selectGame(game.id as GameType)}
                onMouseEnter={() => audio.playInput()}
                className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform origin-left">{game.icon}</div>
                <h3 className="text-2xl font-black text-white uppercase mb-3 tracking-tight">{game.title}</h3>
                <p className="text-slate-400 text-sm mb-6">{game.desc}</p>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 group-hover:bg-emerald-500 group-hover:text-slate-950 px-6 py-2 rounded-full transition-all">Lancer Mission</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div key={resetKey} className="max-w-3xl mx-auto">
          <GameHeader 
            title={currentGame.replace('_', ' ')} 
            onBack={() => setCurrentGame('HUB')} 
            onReset={handleReset} 
            onTutorial={() => setShowTutorial(true)}
          />
          
          {(currentGame === 'SOCIAL_ENGINEERING' || currentGame === 'ACCOUNT_HIJACK') && (
            <div className="space-y-8 animate-in zoom-in duration-500">
              {!isGameFinished ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentGame === 'ACCOUNT_HIJACK' ? 'text-orange-400' : 'text-pink-400'}`}>
                      Mission {scenarioStep + 1} / {currentGame === 'ACCOUNT_HIJACK' ? HIJACK_SCENARIOS.length : SOCIAL_SCENARIOS.length}
                    </span>
                    <span className="text-xl font-black text-white">{score} PTS</span>
                  </div>

                  {(() => {
                    const scenarios = currentGame === 'ACCOUNT_HIJACK' ? HIJACK_SCENARIOS : SOCIAL_SCENARIOS;
                    const scenario = scenarios[scenarioStep];
                    return (
                      <div className={`glass p-8 rounded-[2rem] border ${currentGame === 'ACCOUNT_HIJACK' ? 'border-orange-500/20' : 'border-pink-500/20'} space-y-6 relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">{currentGame === 'ACCOUNT_HIJACK' ? '🚨' : '🧠'}</div>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`${currentGame === 'ACCOUNT_HIJACK' ? 'bg-orange-500' : 'bg-pink-500'} text-slate-950 p-2 rounded-lg font-black text-[10px]`}>{scenario.type}</div>
                          <div className="text-white font-bold">{scenario.title}</div>
                        </div>
                        
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Situation de menace :</div>
                          <div className="text-slate-200 font-medium italic">"{scenario.threat}"</div>
                        </div>

                        <div className="space-y-3 pt-4">
                          {scenario.options.map((option, i) => (
                            <button
                              key={i}
                              onClick={() => handleScenarioChoice(option, scenarios)}
                              onMouseEnter={() => audio.playInput()}
                              disabled={!!scenarioFeedback}
                              className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-bold flex items-center justify-between group ${
                                scenarioFeedback 
                                ? option.isCorrect 
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                  : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50'
                                : `bg-slate-900 border-slate-800 hover:border-${currentGame === 'ACCOUNT_HIJACK' ? 'orange' : 'pink'}-500/50 text-slate-300 hover:bg-slate-800 shadow-lg`
                              }`}
                            >
                              <span>{option.text}</span>
                              {!scenarioFeedback && <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
                            </button>
                          ))}
                        </div>

                        {scenarioFeedback && (
                          <div className="animate-in slide-in-from-top-4 p-4 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 italic">
                            {scenarioFeedback}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="glass p-12 rounded-[3rem] border border-emerald-500/20 text-center space-y-8 animate-in zoom-in">
                  <div className="text-7xl">🏆</div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Mission Terminée</h2>
                  <p className="text-slate-400">Votre score final: <span className="text-emerald-400 font-black">{score} PTS</span></p>
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-sm text-slate-300 italic text-left">
                    <span className="font-black text-white uppercase text-[10px] block mb-2 tracking-widest text-emerald-500">Leçon apprise :</span>
                    {currentGame === 'ACCOUNT_HIJACK' 
                      ? "La sécurité d'un compte ne repose pas uniquement sur le mot de passe, mais sur une stratégie multi-couche : 2FA, alertes de connexion et hygiène des sessions."
                      : "L'ingénierie sociale manipule nos instincts primaires. Ralentir et vérifier l'identité de l'interlocuteur est votre meilleure défense."}
                  </div>
                  <button 
                    onClick={handleReset}
                    className="bg-emerald-500 text-slate-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
                  >
                    REJOUER
                  </button>
                </div>
              )}
            </div>
          )}

          {currentGame === 'PHISH_HUNT' && (
            <div className="glass p-20 rounded-[3rem] border border-emerald-500/20 text-center space-y-8 animate-in zoom-in shadow-2xl">
              <div className="text-8xl mb-4">🎣</div>
              <h2 className="text-3xl font-black text-white">SIMULATEUR PHISH HUNT</h2>
              <p className="text-slate-400">Analysez les en-têtes et les liens suspects pour protéger votre boîte mail.</p>
              <button 
                onClick={() => { audio.playSuccess(); audio.playPopup(); }} 
                className="bg-emerald-500 text-slate-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
              >
                Démarrer Analyse
              </button>
            </div>
          )}

          {currentGame === 'FIREWALL_DEFENSE' && (
            <div className="glass p-20 rounded-[3rem] border border-cyan-500/20 text-center space-y-8 animate-in zoom-in shadow-2xl">
              <div className="text-8xl mb-4">🛡️</div>
              <h2 className="text-3xl font-black text-white">FIREWALL FLOW</h2>
              <p className="text-slate-400">Neutralisez les paquets rouges (virus) et laissez passer les verts (données).</p>
              <button 
                onClick={() => { audio.playSuccess(); audio.playPopup(); }} 
                className="bg-cyan-500 text-slate-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyan-500/20"
              >
                Initialiser Pare-feu
              </button>
            </div>
          )}

          {currentGame === 'PASSWORD_HERO' && (
            <div className="glass p-20 rounded-[3rem] border border-purple-500/20 text-center space-y-8 animate-in zoom-in shadow-2xl">
              {!isGameFinished ? (
                <>
                  <div className="text-8xl mb-4">🔐</div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">PASSWORD HERO</h2>
                  <p className="text-slate-400 text-sm">Créez un mot de passe de plus de 12 caractères avec un symbole pour gagner.</p>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Tapez un mot de passe fort..." 
                      onKeyPress={(e) => { audio.playInput(); if(e.key === 'Enter') checkPasswordHero(); }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-center font-mono focus:border-purple-500/50 outline-none" 
                    />
                    <button 
                      onClick={checkPasswordHero} 
                      className="w-full bg-purple-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-purple-500/20"
                    >
                      Tester la robustesse
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-8">
                  <div className="text-7xl animate-bounce">🛡️</div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Coffre-fort Scellé !</h2>
                  <p className="text-emerald-400 font-bold">Score: +500 PTS</p>
                  <button onClick={handleReset} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-700">Recommencer</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniGames;
