
import React, { useState, useEffect, useRef } from 'react';
import { QUIZ_QUESTIONS } from '../constants.ts';
import { getCyberAdvice } from '../services/geminiService.ts';

interface Player {
  id: string;
  name: string;
  score: number;
  progress: number;
  isBot: boolean;
  avatar: string;
}

interface BattleQuizProps {
  onBack: () => void;
}

const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 100;
const SPEED_TIME_LIMIT = 10000; // 10 secondes pour le bonus maximum

const BattleQuiz: React.FC<BattleQuizProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'LOBBY' | 'PLAYING' | 'FINISHED'>('LOBBY');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [players, setPlayers] = useState<Player[]>([
    { id: 'me', name: 'VOUS (Légende)', score: 0, progress: 0, isBot: false, avatar: '👤' },
    { id: 'bot1', name: 'SpeedHacker_42', score: 0, progress: 0, isBot: true, avatar: '⚡' },
    { id: 'bot2', name: 'CyberSentinel', score: 0, progress: 0, isBot: true, avatar: '🛡️' },
    { id: 'bot3', name: 'Noob_Admin', score: 0, progress: 0, isBot: true, avatar: '🐢' },
  ]);
  const [answered, setAnswered] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [lastPointsEarned, setLastPointsEarned] = useState<{points: number, bonus: number} | null>(null);
  
  const questionStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startBattle = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          setGameState('PLAYING');
          questionStartTimeRef.current = Date.now();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  // Bot logic simulating speed and accuracy
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setPlayers(prev => {
        const anyBotCanAnswer = prev.some(p => p.isBot && p.progress < 100);
        if (!anyBotCanAnswer) return prev;

        return prev.map(p => {
          if (!p.isBot || p.progress >= 100) return p;

          // Check current question index for this bot
          const botQuestionIndex = Math.floor((p.progress / 100) * QUIZ_QUESTIONS.length);
          
          // Logic for answering
          const rand = Math.random();
          let answerChance = 0.05;
          let accuracy = 0.9;
          let speedFactor = 1.0; // 1.0 = average

          if (p.id === 'bot1') { answerChance = 0.15; accuracy = 0.85; speedFactor = 1.5; }
          if (p.id === 'bot3') { answerChance = 0.04; accuracy = 0.50; speedFactor = 0.5; }

          if (rand < answerChance) {
            const isCorrect = Math.random() < accuracy;
            const nextQIndex = botQuestionIndex + 1;
            
            // Calculate simulated speed bonus for bot
            // Bots that answer faster get higher simulated bonus
            const simulatedTimeTaken = Math.random() * (SPEED_TIME_LIMIT / speedFactor);
            const speedBonus = isCorrect ? Math.max(0, Math.floor((1 - simulatedTimeTaken / SPEED_TIME_LIMIT) * MAX_SPEED_BONUS)) : 0;
            
            const earnedPoints = isCorrect ? (BASE_POINTS + speedBonus) : 0;
            const newProgress = Math.min(100, (nextQIndex / QUIZ_QUESTIONS.length) * 100);
            
            return { ...p, score: p.score + earnedPoints, progress: newProgress };
          }
          return p;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Check if battle finished
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const allFinished = players.every(p => p.progress >= 100);
      if (allFinished) {
        setGameState('FINISHED');
        generateAIFeedback();
      }
    }
  }, [players, gameState]);

  const generateAIFeedback = async () => {
    const myPlayer = players.find(p => p.id === 'me');
    const myScore = myPlayer?.score || 0;
    const sorted = [...players].sort((a,b) => b.score - a.score);
    const rank = sorted.findIndex(p => p.id === 'me') + 1;
    
    const context = `Battle terminée. Joueur rang ${rank}/4. Score: ${myScore}. 
    Le gagnant était ${sorted[0].name} avec ${sorted[0].score} points. 
    Fais un commentaire d'expert cyber (2 phrases max) sarcastique sur sa rapidité ou son manque de précision.`;
    
    const advice = await getCyberAdvice(context);
    setAiAnalysis(advice);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (answered) return;
    setAnswered(true);

    const timeTaken = Date.now() - questionStartTimeRef.current;
    const speedBonus = isCorrect ? Math.max(0, Math.floor((1 - timeTaken / SPEED_TIME_LIMIT) * MAX_SPEED_BONUS)) : 0;
    const totalPoints = isCorrect ? (BASE_POINTS + speedBonus) : 0;

    setLastPointsEarned({ points: totalPoints, bonus: speedBonus });

    setPlayers(prev => prev.map(p => {
      if (p.id === 'me') {
        const nextQ = currentQ + 1;
        return { 
          ...p, 
          score: p.score + totalPoints, 
          progress: (nextQ / QUIZ_QUESTIONS.length) * 100 
        };
      }
      return p;
    }));

    setTimeout(() => {
      setLastPointsEarned(null);
      if (currentQ + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQ(prev => prev + 1);
        setAnswered(false);
        questionStartTimeRef.current = Date.now();
      }
    }, 1500);
  };

  if (gameState === 'LOBBY') {
    return (
      <div className="max-w-2xl mx-auto glass p-12 rounded-[3rem] border border-cyan-500/20 text-center space-y-8 animate-in zoom-in">
        <div className="flex justify-center -space-x-4 mb-8">
          {players.map(p => (
            <div key={p.id} className="w-16 h-16 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-3xl shadow-xl">
              {p.avatar}
            </div>
          ))}
        </div>
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">PRÊT POUR LA CYBER-BATTLE ?</h2>
        <div className="space-y-2">
          <p className="text-slate-400">Règle d'or : <span className="text-cyan-400 font-bold">Exactitude + Rapidité = Domination</span></p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Score = 100 pts (Juste) + jusqu'à 100 pts (Vitesse)</p>
        </div>
        
        {countdown !== null ? (
          <div className="text-8xl font-black text-cyan-400 animate-bounce">{countdown}</div>
        ) : (
          <button 
            onClick={startBattle}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all hover:scale-105"
          >
            Lancer le Match
          </button>
        )}
        <button onClick={onBack} className="block w-full text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4">Retour</button>
      </div>
    );
  }

  if (gameState === 'FINISHED') {
    const sorted = [...players].sort((a,b) => b.score - a.score);
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
        <div className="glass p-12 rounded-[3rem] border border-cyan-500/20 text-center">
          <h2 className="text-5xl font-black text-white mb-8 uppercase italic tracking-tighter">Podium Final</h2>
          <div className="space-y-4">
            {sorted.map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${p.id === 'me' ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-900/50 border-slate-800'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="text-left">
                    <span className={`font-black uppercase text-xs block ${p.id === 'me' ? 'text-cyan-400' : 'text-white'}`}>{p.name}</span>
                    <div className="h-1 w-24 bg-slate-800 rounded-full mt-1 overflow-hidden">
                       <div className="h-full bg-slate-600" style={{width: `${p.progress}%`}} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white tabular-nums">{p.score}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase block tracking-widest">Points Totaux</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-8 bg-slate-950/80 rounded-[2rem] border border-slate-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">🤖</div>
             <div className="flex items-center space-x-3 mb-4">
               <span className="text-2xl">⚡</span>
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Analyse Stratégique</span>
             </div>
             <p className="text-sm text-cyan-200 italic leading-relaxed text-left border-l-2 border-cyan-500 pl-4">
               {aiAnalysis || "Calcul des métriques de performance..."}
             </p>
          </div>

          <button 
            onClick={onBack}
            className="mt-10 bg-white text-slate-950 px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            Quitter le Lobby
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = QUIZ_QUESTIONS[currentQ];

  return (
    <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Quiz UI */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden shadow-2xl">
          {/* Dynamic Points Indicator */}
          {lastPointsEarned && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in fade-out duration-1000 fill-mode-forwards pointer-events-none">
              <div className="text-center">
                <div className={`text-6xl font-black ${lastPointsEarned.points > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                  {lastPointsEarned.points > 0 ? `+${lastPointsEarned.points}` : '0'}
                </div>
                {lastPointsEarned.bonus > 0 && (
                  <div className="text-cyan-400 font-black text-sm uppercase tracking-[0.2em]">Bonus Vitesse: +{lastPointsEarned.bonus}</div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">Flux de Données {currentQ + 1} / {QUIZ_QUESTIONS.length}</span>
            <span className="text-cyan-400 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-ping"></span>
              Synchronisation Active
            </span>
          </div>
          
          <h3 className="text-3xl font-bold text-white leading-tight tracking-tight">{currentQuestion.text}</h3>
          
          <div className="grid gap-3">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                disabled={answered}
                onClick={() => handleAnswer(i === currentQuestion.correctAnswer)}
                className={`p-6 rounded-2xl border text-left font-bold transition-all flex items-center justify-between group ${
                  answered ? (i === currentQuestion.correctAnswer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 opacity-50 text-slate-600')
                  : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500 text-slate-300 hover:bg-slate-800 shadow-lg'
                }`}
              >
                <span>{opt}</span>
                {answered && i === currentQuestion.correctAnswer && <span className="text-xl">✓</span>}
              </button>
            ))}
          </div>

          {/* Speed Indicator Bar */}
          <div className="space-y-2 mt-4">
             <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-500">
               <span>Chronomètre de Précision</span>
               <span>Potentiel de Bonus</span>
             </div>
             <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 animate-shrink-width" style={{animationDuration: `${SPEED_TIME_LIMIT}ms`, animationTimingFunction: 'linear'}} />
             </div>
          </div>
        </div>
      </div>

      {/* Leaderboard UI */}
      <div className="space-y-6">
        <div className="glass p-8 rounded-[2.5rem] border border-cyan-500/20 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase text-cyan-400 tracking-[0.2em]">Leaderboard Live</h4>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="space-y-6">
            {[...players].sort((a,b) => b.score - a.score).map((p, idx) => (
              <div key={p.id} className={`space-y-2 transition-all duration-500 ${p.id === 'me' ? 'scale-105' : 'opacity-80'}`}>
                <div className="flex justify-between text-[10px] font-black uppercase items-end">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 font-mono">#{idx + 1}</span>
                    <span className="text-xl">{p.avatar}</span>
                    <span className={p.id === 'me' ? 'text-cyan-400 underline underline-offset-4' : 'text-slate-300'}>{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-mono text-sm">{p.score}</span>
                  </div>
                </div>
                <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className={`h-full transition-all duration-700 shadow-[0_0_8px_rgba(6,182,212,0.4)] ${p.id === 'me' ? 'bg-cyan-400' : 'bg-slate-600'}`} 
                    style={{ width: `${p.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl text-center space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conseil Tactique</p>
          <p className="text-[11px] text-slate-400 italic">"Ne sacrifiez pas la précision pour la vitesse. Une erreur vaut 0 point, peu importe votre temps de réponse."</p>
        </div>
      </div>

      <style>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink-width {
          animation-name: shrink-width;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default BattleQuiz;
