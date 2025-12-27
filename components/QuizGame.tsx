
import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../constants.ts';
import BattleQuiz from './BattleQuiz.tsx';

type QuizMode = 'SELECT' | 'SOLO' | 'BATTLE';

const QuizGame: React.FC = () => {
  const [mode, setMode] = useState<QuizMode>('SELECT');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setMode('SELECT');
  };

  if (mode === 'SELECT') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-8 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Centre d'Évaluation</h2>
          <p className="text-slate-400 text-lg">Choisissez votre mode d'entraînement pour tester votre bouclier numérique.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div 
            onClick={() => setMode('SOLO')}
            className="glass p-10 rounded-[2.5rem] border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer group hover:scale-[1.02] shadow-2xl"
          >
            <div className="text-6xl mb-6 group-hover:rotate-12 transition-transform">📖</div>
            <h3 className="text-2xl font-black text-white uppercase mb-3">Mode Solo</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Apprenez à votre rythme avec des explications détaillées après chaque question. Idéal pour approfondir vos bases.
            </p>
            <button className="bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
              Commencer l'Étude
            </button>
          </div>

          <div 
            onClick={() => setMode('BATTLE')}
            className="glass p-10 rounded-[2.5rem] border border-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-pointer group hover:scale-[1.02] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[8px] font-black px-4 py-1 uppercase tracking-widest rotate-45 translate-x-4 translate-y-2">Live</div>
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">⚔️</div>
            <h3 className="text-2xl font-black text-white uppercase mb-3">Cyber-Battle</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Affrontez d'autres experts en temps réel. La vitesse compte autant que la justesse. Soyez le premier du classement !
            </p>
            <button className="bg-cyan-500 text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
              Rejoindre le Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'BATTLE') {
    return <BattleQuiz onBack={() => setMode('SELECT')} />;
  }

  if (showResult) {
    return (
      <div className="glass p-12 rounded-[3rem] border border-emerald-500/20 text-center animate-in zoom-in shadow-2xl max-w-2xl mx-auto">
        <h2 className="text-4xl font-black text-white mb-6">RÉSULTAT SOLO</h2>
        <div className="text-7xl font-black text-emerald-400 mb-4">{score} / {QUIZ_QUESTIONS.length}</div>
        <p className="text-slate-400 mb-8 text-lg leading-relaxed">
          {score === QUIZ_QUESTIONS.length ? "Parfait ! Vous êtes un véritable cyber-défenseur." : score > QUIZ_QUESTIONS.length / 2 ? "Bravo ! Vous avez une solide connaissance des menaces." : "Continuez à vous entraîner pour renforcer votre bouclier numérique."}
        </p>
        <button 
          onClick={restartQuiz}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-12 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
        >
          RETOUR AU MENU
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setMode('SELECT')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">← Quitter</button>
        <div className="space-y-1 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Progression</p>
          <div className="flex items-center space-x-2">
             <div className="h-2 w-48 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
             </div>
             <span className="text-xs font-bold text-slate-400">{currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Score</p>
          <p className="text-2xl font-black text-emerald-400 tabular-nums">{score}</p>
        </div>
      </div>

      <div className="glass p-10 rounded-[2.5rem] border border-emerald-500/10 shadow-2xl space-y-8">
        <div className="space-y-4">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            currentQuestion.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            Difficulté: {currentQuestion.difficulty}
          </span>
          <h3 className="text-2xl font-bold text-white leading-tight">
            {currentQuestion.text}
          </h3>
        </div>

        <div className="grid gap-4">
          {currentQuestion.options.map((option, index) => {
            let stateClass = "bg-slate-900 border-slate-800 hover:border-emerald-500/50 text-slate-300";
            if (isAnswered) {
              if (index === currentQuestion.correctAnswer) {
                stateClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
              } else if (selectedOption === index) {
                stateClass = "bg-red-500/20 border-red-500 text-red-400";
              } else {
                stateClass = "bg-slate-900/50 border-slate-800 text-slate-600 opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                className={`p-6 rounded-2xl border text-left font-medium transition-all flex items-center justify-between group ${stateClass}`}
              >
                <span>{option}</span>
                {isAnswered && index === currentQuestion.correctAnswer && <span className="text-xl">✅</span>}
                {isAnswered && selectedOption === index && index !== currentQuestion.correctAnswer && <span className="text-xl">❌</span>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="animate-in slide-in-from-top-4 duration-500 space-y-6">
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 italic text-slate-400 text-sm leading-relaxed">
              <span className="font-bold text-emerald-400 not-italic block mb-2 uppercase text-[10px] tracking-widest">Explication :</span>
              "{currentQuestion.explanation}"
            </div>
            <button 
              onClick={handleNext}
              className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
            >
              {currentQuestionIndex + 1 === QUIZ_QUESTIONS.length ? "Voir les résultats" : "Question Suivante"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;
