
import React, { useState, useEffect } from 'react';
import { getCyberAdvice } from '../services/geminiService.ts';

type AttackType = 'SQLI' | 'XSS' | 'BRUTE';

interface AttackSimulatorProps {
  onCompromise?: (state: boolean) => void;
}

const AttackSimulator: React.FC<AttackSimulatorProps> = ({ onCompromise }) => {
  const [activeSim, setActiveSim] = useState<AttackType>('SQLI');
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<{ type: 'info' | 'error' | 'success' | 'warn', msg: string }[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bruteProgress, setBruteProgress] = useState(0);

  const addLog = (msg: string, type: 'info' | 'error' | 'success' | 'warn' = 'info') => {
    setLogs(prev => [...prev, { type, msg: `[${new Date().toLocaleTimeString()}] ${msg}` }]);
  };

  const reset = () => {
    setInput('');
    setLogs([]);
    setAiAnalysis(null);
    setBruteProgress(0);
    if (onCompromise) onCompromise(false);
  };

  const runSimulation = async () => {
    if (!input.trim() && activeSim !== 'BRUTE') return;
    
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    let success = false;
    let detail = "";

    if (activeSim === 'SQLI') {
      addLog("Tentative de connexion à la base de données...", "info");
      const sqlPattern = /' OR '|'--|DROP TABLE|UNION SELECT/i;
      if (sqlPattern.test(input)) {
        success = true;
        addLog("ALERTE: Injection SQL détectée !", "warn");
        addLog("LOGIQUE BYPASSÉE: Requête SQL corrompue.", "success");
        addLog("ACCÈS ACCORDÉ: Identité de l'administrateur usurpée.", "success");
        addLog("CRITICAL: Leak de la table des agents IA en cours...", "error");
        detail = "L'utilisateur a utilisé une injection SQL pour contourner l'authentification.";
        if (onCompromise) onCompromise(true);
      } else {
        addLog("Erreur: Identifiants invalides.", "error");
        detail = "Tentative de connexion échouée (sécurisée).";
      }
    } else if (activeSim === 'XSS') {
      addLog("Soumission du commentaire sur le serveur...", "info");
      const xssPattern = /<script|onclick|onload|alert\(|javascript:/i;
      if (xssPattern.test(input)) {
        success = true;
        addLog("ALERTE: Script malveillant injecté !", "warn");
        addLog("RÉSULTAT: Le navigateur exécute le script arbitraire.", "success");
        addLog("VOL DE SESSION: Cookies potentiellement compromis.", "error");
        detail = "Une attaque Cross-Site Scripting (XSS) a été simulée via l'injection d'un tag script ou d'un attribut d'événement.";
      } else {
        addLog("Commentaire publié avec succès.", "success");
        detail = "Commentaire inoffensif publié.";
      }
    } else if (activeSim === 'BRUTE') {
      addLog("Lancement du script de force brute...", "info");
      for (let i = 0; i <= 100; i += 10) {
        setBruteProgress(i);
        await new Promise(r => setTimeout(r, 200));
        if (i === 40) addLog("Test des 10 000 mots de passe les plus communs...", "info");
        if (i === 80) addLog("Combinaison trouvée dans la wordlist...", "warn");
      }
      success = true;
      addLog("SUCCÈS: Mot de passe 'p@ssword123' trouvé en 1.2 secondes.", "success");
      detail = "Une attaque par force brute a été simulée en utilisant une liste de mots de passe courants.";
    }

    const advice = await getCyberAdvice(`Explique brièvement pourquoi cette attaque (${activeSim}) ${success ? 'a réussi' : 'a échoué'} avec l'input suivant: "${input}". Donne 2 étapes de mitigation pour un développeur.`);
    setAiAnalysis(advice);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Sandbox d'Attaque</h2>
        <p className="text-slate-400">Comprenez le mécanisme des vulnérabilités en les pratiquant dans un environnement sécurisé.</p>
      </div>

      <div className="flex justify-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
        {(['SQLI', 'XSS', 'BRUTE'] as AttackType[]).map(type => (
          <button
            key={type}
            onClick={() => { setActiveSim(type); reset(); }}
            className={`px-6 py-3 rounded-xl font-black text-xs transition-all tracking-widest ${activeSim === type ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-white'}`}
          >
            {type === 'SQLI' ? 'SQL INJECTION' : type === 'XSS' ? 'CROSS-SITE SCRIPTING' : 'BRUTE FORCE'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Terminal / Sandbox Input */}
        <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6 flex flex-col min-h-[500px]">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
             <div className="flex space-x-1.5">
               <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
             </div>
             <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest ml-4">Payload Lab</span>
          </div>

          <div className="flex-grow space-y-6">
            {activeSim === 'SQLI' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">Simulez un bypass de login. Indice: <code>' OR '1'='1</code></p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Username / Email</label>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="admin' --"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 font-mono focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>
            )}

            {activeSim === 'XSS' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">Injectez du HTML ou des scripts. Indice: <code>&lt;script&gt;alert(1)&lt;/script&gt;</code></p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Commentaire Public</label>
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hello <img src=x onerror=alert(1)>"
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 font-mono focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>
              </div>
            )}

            {activeSim === 'BRUTE' && (
              <div className="space-y-6 py-8 text-center">
                <p className="text-sm text-slate-300">Démonstration de la vitesse de crack sur une wordlist standard.</p>
                <div className="relative h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                    style={{ width: `${bruteProgress}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Passwords / Sec</p>
                    <p className="text-xl font-black text-white">85,200</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Succès</p>
                    <p className="text-xl font-black text-red-500">{bruteProgress === 100 ? 'YES' : '...'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <button onClick={reset} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Vider les logs</button>
            <button 
              onClick={runSimulation}
              disabled={isAnalyzing || (activeSim !== 'BRUTE' && !input.trim())}
              className="bg-white text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              Exécuter Payload
            </button>
          </div>
        </div>

        {/* Console / Output */}
        <div className="bg-slate-950 rounded-[2rem] border border-slate-800 flex flex-col overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Console Output</h3>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Live Monitor</span>
            </div>
          </div>
          
          <div className="flex-grow p-6 font-mono text-[11px] space-y-1.5 overflow-y-auto max-h-[250px] custom-scrollbar">
            {logs.length === 0 && <p className="text-slate-700 italic">En attente d'activité...</p>}
            {logs.map((log, i) => (
              <p key={i} className={
                log.type === 'error' ? 'text-red-500' : 
                log.type === 'success' ? 'text-emerald-400' : 
                log.type === 'warn' ? 'text-yellow-400' : 'text-slate-400'
              }>
                {log.msg}
              </p>
            ))}
          </div>

          <div className="bg-slate-900/50 p-6 border-t border-slate-800">
            <div className="flex items-center space-x-2 mb-4">
               <span className="text-xl">🤖</span>
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Rapport d'Analyse IA</h4>
            </div>
            
            <div className="min-h-[120px] text-xs text-slate-300 leading-relaxed italic">
              {isAnalyzing ? (
                <div className="flex items-center space-x-2 text-slate-500 animate-pulse">
                  <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span>Génération du diagnostic...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {aiAnalysis}
                </div>
              ) : (
                <p className="text-slate-600">Lancez une simulation pour obtenir une explication détaillée et les mesures de protection.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackSimulator;
