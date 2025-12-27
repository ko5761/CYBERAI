
import React, { useState, useRef, useEffect } from 'react';
import { getCyberAdvice, generateSpeech, decodeBase64, decodeAudioData, generateContextualQuiz } from '../services/geminiService.ts';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  isAudioPlaying?: boolean;
  quiz?: ContextualQuiz;
}

interface ContextualQuiz {
  topic: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  currentQuestionIndex: number;
  score: number;
  isFinished: boolean;
  selectedOption: number | null;
}

interface ChatBotProps {
  isCompromised?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ isCompromised }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Bonjour ! Je suis votre assistant expert en cybersécurité. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isCompromised) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'E̸R̴R̷O̴R̴:̸ ̴S̴y̷s̷t̸e̴m̸ ̵C̵o̸m̷p̸r̷o̸m̸i̸s̴e̴d̴.̵ ̶A̵c̷c̷è̴s̴ ̷r̷o̶o̴t̷ ̵d̶é̵t̸e̵c̵t̵é̴.̷ ̶D̷o̵n̴n̴é̴e̴s̶ ̶e̸n̵ ̵c̸o̴u̸r̸s̷ ̸d̸\'̸e̸x̵f̸i̶l̶t̸r̸a̴t̵i̷o̵n̸.̶.̵.̶' 
      }]);
    }
  }, [isCompromised]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSpeech = async (text: string, index: number) => {
    if (isReading) return;
    
    setIsReading(true);
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAudioPlaying: true } : m));

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const base64Audio = await generateSpeech(text, isCompromised ? 'Puck' : 'Kore');
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
          decodeBase64(base64Audio),
          audioContextRef.current,
          24000,
          1
        );
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          setIsReading(false);
          setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAudioPlaying: false } : m));
        };
        source.start(0);
      } else {
        setIsReading(false);
        setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAudioPlaying: false } : m));
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsReading(false);
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAudioPlaying: false } : m));
    }
  };

  const startQuiz = async (topic: string) => {
    setIsLoading(true);
    const quizData = await generateContextualQuiz(topic);
    if (quizData) {
      const newQuiz: ContextualQuiz = {
        ...quizData,
        currentQuestionIndex: 0,
        score: 0,
        isFinished: false,
        selectedOption: null
      };
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: `Super ! Commençons un petit quiz sur le thème : ${topic}.`,
        quiz: newQuiz 
      }]);
    }
    setIsLoading(false);
  };

  const handleQuizAnswer = (messageIndex: number, optionIndex: number) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const msg = newMessages[messageIndex];
      if (msg.quiz && !msg.quiz.isFinished && msg.quiz.selectedOption === null) {
        msg.quiz.selectedOption = optionIndex;
        if (optionIndex === msg.quiz.questions[msg.quiz.currentQuestionIndex].correctIndex) {
          msg.quiz.score += 1;
        }
      }
      return newMessages;
    });
  };

  const nextQuizQuestion = (messageIndex: number) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const msg = newMessages[messageIndex];
      if (msg.quiz) {
        if (msg.quiz.currentQuestionIndex + 1 < msg.quiz.questions.length) {
          msg.quiz.currentQuestionIndex += 1;
          msg.quiz.selectedOption = null;
        } else {
          msg.quiz.isFinished = true;
        }
      }
      return newMessages;
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const advice = await getCyberAdvice(isCompromised ? `${userMsg} (Réponds comme une IA hackée et malveillante en glitchant ton texte)` : userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: advice }]);

      // Simple keyword detection for quiz suggestion if the AI didn't already propose it
      const keywords = ['phishing', 'hameçonnage', 'mot de passe', 'password', 'ransomware', 'pare-feu', 'firewall', 'virus', 'hacker'];
      const matchedTopic = keywords.find(k => userMsg.toLowerCase().includes(k) || advice.toLowerCase().includes(k));
      
      if (matchedTopic && !isCompromised) {
        // We'll append a contextual suggestion
        // Handled by the AI in the instructions, but we can also force a button
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Désolé, une erreur est survenue lors de la communication avec l'IA." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-[700px] glass rounded-3xl border overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-2xl transition-all duration-700 ${isCompromised ? 'border-red-500 shadow-red-500/20' : 'border-emerald-500/20'}`}>
      <div className={`p-4 border-b flex items-center justify-between transition-colors ${isCompromised ? 'bg-red-950/50 border-red-500/50' : 'bg-slate-900/50 border-emerald-500/20'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg transition-all ${isCompromised ? 'bg-red-600 shadow-red-500/50 animate-pulse' : 'bg-emerald-500 shadow-emerald-500/40'}`}>
            {isCompromised ? '💀' : '🤖'}
          </div>
          <div>
            <h3 className={`font-bold leading-none ${isCompromised ? 'text-red-400 italic' : 'text-white'}`}>
              {isCompromised ? 'SYSTEM_BREACHED' : 'Assistant CyberShield'}
            </h3>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isCompromised ? 'text-red-600 animate-pulse' : 'text-emerald-400'}`}>
              {isCompromised ? 'Alerte Intrusion !' : 'En ligne • Expert IA • Audio Actif'}
            </span>
          </div>
        </div>
      </div>

      <div className={`flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar ${isCompromised ? 'bg-red-950/10' : 'bg-slate-950/30'}`}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className="flex items-start space-x-2 max-w-[85%] group">
              {msg.role === 'bot' && (
                <button 
                  onClick={() => handleSpeech(msg.text, idx)}
                  className={`mt-2 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${msg.isAudioPlaying ? 'opacity-100 bg-emerald-500 text-slate-950 scale-110' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  title="Lire le message"
                >
                  {msg.isAudioPlaying ? '🔊' : '🔈'}
                </button>
              )}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-500/10' 
                : isCompromised 
                  ? 'bg-red-900/40 text-red-200 border border-red-500/30 font-mono rounded-tl-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {msg.text}

                {/* Detect quiz suggestions in text and show button */}
                {!msg.quiz && msg.role === 'bot' && !isCompromised && (msg.text.toLowerCase().includes('tester') || msg.text.toLowerCase().includes('connaissances')) && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button 
                      onClick={() => startQuiz("Cybersécurité Générale")}
                      className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      🎯 Lancer le mini-quiz interactif
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* In-chat Quiz UI */}
            {msg.quiz && (
              <div className="mt-4 w-full max-w-[85%] glass p-6 rounded-[2rem] border border-emerald-500/20 shadow-xl animate-in zoom-in duration-300">
                {!msg.quiz.isFinished ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      <span>Question {msg.quiz.currentQuestionIndex + 1} / {msg.quiz.questions.length}</span>
                      <span>Sujet: {msg.quiz.topic}</span>
                    </div>
                    <p className="font-bold text-white">{msg.quiz.questions[msg.quiz.currentQuestionIndex].question}</p>
                    <div className="grid gap-2">
                      {msg.quiz.questions[msg.quiz.currentQuestionIndex].options.map((opt, oIdx) => {
                        const isSelected = msg.quiz!.selectedOption === oIdx;
                        const isCorrect = oIdx === msg.quiz!.questions[msg.quiz!.currentQuestionIndex].correctIndex;
                        let btnClass = "bg-slate-900 border-slate-800 text-slate-400 hover:border-emerald-500/50";
                        
                        if (msg.quiz!.selectedOption !== null) {
                          if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                          else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                          else btnClass = "bg-slate-900 opacity-50 border-slate-800";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={msg.quiz!.selectedOption !== null}
                            onClick={() => handleQuizAnswer(idx, oIdx)}
                            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${btnClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {msg.quiz.selectedOption !== null && (
                      <div className="animate-in slide-in-from-top-2">
                        <p className="text-[10px] text-slate-400 italic mb-3">"{msg.quiz.questions[msg.quiz.currentQuestionIndex].explanation}"</p>
                        <button 
                          onClick={() => nextQuizQuestion(idx)}
                          className="w-full bg-white text-slate-950 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          {msg.quiz.currentQuestionIndex + 1 < msg.quiz.questions.length ? "Question suivante" : "Voir mon score"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-4">
                    <div className="text-4xl">🎯</div>
                    <h4 className="font-black text-white uppercase tracking-tighter">Quiz Terminé !</h4>
                    <p className="text-2xl font-black text-emerald-400">{msg.quiz.score} / {msg.quiz.questions.length}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {msg.quiz.score === msg.quiz.questions.length ? "Parfait ! Expert confirmé." : "Continuez à apprendre !"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className={`p-4 rounded-2xl rounded-tl-none border ${isCompromised ? 'bg-red-900/20 border-red-500/20' : 'bg-slate-800 border-slate-700'}`}>
              <div className="flex space-x-1">
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isCompromised ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${isCompromised ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${isCompromised ? 'bg-red-500' : 'bg-slate-500'}`}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-4 border-t transition-colors ${isCompromised ? 'bg-red-950/80 border-red-500/50' : 'bg-slate-900/80 border-emerald-500/20'}`}>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isCompromised ? "Saisir commande root..." : "Posez une question ou demandez un quiz..."}
            className={`flex-grow border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none ${
              isCompromised 
              ? 'bg-slate-950 border-red-900 text-red-500 focus:border-red-500' 
              : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500/50'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 ${
              isCompromised 
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
            }`}
          >
            {isCompromised ? 'EXECUT' : 'ENVOYER'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
