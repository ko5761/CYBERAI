
import React, { useState } from 'react';
import { analyzeLink, analyzeEmailContent, analyzeDdosTraffic, analyzeLogs } from '../services/geminiService.ts';

type ToolTab = 'password' | 'link' | 'email' | 'ddos' | 'logs';

const SAMPLES = {
  BANK_PHISH: `De: securite@votre-banque-online.com\nObjet: ALERTE : Activité suspecte sur votre compte !\n\nVeuillez cliquer sur le lien : https://bit.ly/secure-auth-3921-check`,
  DDOS_TRAFFIC: `[2024-05-24 14:02:01] IN: 12500 pps\n[2024-05-24 14:02:03] IN: 48200 pps\n[2024-05-24 14:02:05] IN: 131000 pps`,
  SUSPICIOUS_URL: `http://secure-login-bank-verification.net/update-account/auth?id=9283`,
  SYSLOG_SAMPLE: `May 24 10:45:12 srv-prod sshd[1234]: Failed password for invalid user admin from 192.168.1.45 port 54322 ssh2
May 24 10:45:15 srv-prod sshd[1234]: Failed password for invalid user admin from 192.168.1.45 port 54324 ssh2
May 24 10:45:18 srv-prod sshd[1234]: Failed password for invalid user guest from 192.168.1.45 port 54326 ssh2
May 24 10:45:20 srv-prod sshd[1234]: Failed password for invalid user root from 192.168.1.45 port 54328 ssh2`
};

const SecurityTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('password');
  const [password, setPassword] = useState('');
  const [emailText, setEmailText] = useState('');
  const [ddosText, setDdosText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [logsText, setLogsText] = useState('');
  
  const [emailResult, setEmailResult] = useState<any>(null);
  const [ddosResult, setDdosResult] = useState<any>(null);
  const [linkResult, setLinkResult] = useState<any>(null);
  const [logsResult, setLogsResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getPasswordStats = (pwd: string) => {
    if (!pwd) return null;
    const entropy = Math.floor(pwd.length * 4.5);
    const checks = { 
      length: pwd.length >= 12, 
      upper: /[A-Z]/.test(pwd), 
      number: /[0-9]/.test(pwd), 
      special: /[^A-Za-z0-9]/.test(pwd) 
    };
    return { score: Math.min(entropy * 2, 100), checks, timeLabel: entropy > 50 ? "Plusieurs années" : "Quelques minutes" };
  };

  const pwdStats = getPasswordStats(password);

  const handleLinkAnalysis = async () => {
    if (!linkUrl.trim()) return;
    setIsAnalyzing(true);
    setLinkResult(null);
    try {
      const result = await analyzeLink(linkUrl);
      setLinkResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEmailAnalysis = async () => {
    if (!emailText.trim()) return;
    setIsAnalyzing(true);
    setEmailResult(null);
    try {
      const result = await analyzeEmailContent(emailText);
      setEmailResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDdosAnalysis = async () => {
    if (!ddosText.trim()) return;
    setIsAnalyzing(true);
    setDdosResult(null);
    try {
      const result = await analyzeDdosTraffic(ddosText);
      setDdosResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogsAnalysis = async () => {
    if (!logsText.trim()) return;
    setIsAnalyzing(true);
    setLogsResult(null);
    try {
      const result = await analyzeLogs(logsText);
      setLogsResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const TrafficGraph = ({ data }: { data: string }) => {
    const lines = (data || '').split('\n').filter(l => l.includes('pps'));
    const ppsValues = lines.map(l => {
      const match = l.match(/IN: (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const max = Math.max(...ppsValues, 10000);

    return (
      <div className="flex items-end justify-between h-32 w-full gap-1 p-2 bg-slate-950/50 rounded-xl border border-slate-800 relative mb-4">
        {ppsValues.map((v, i) => (
          <div key={i} className={`flex-grow rounded-t-sm transition-all duration-500 ${v/max > 0.6 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ height: `${(v/max)*100}%` }} />
        ))}
        {ppsValues.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 uppercase tracking-widest">En attente de logs...</div>}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Diagnostic Expert</h2>
        <p className="text-slate-400 text-sm">Outils forensiques assistés par IA pour l'analyse des menaces.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {(['password', 'link', 'email', 'ddos', 'logs'] as const).map(t => (
          <button 
            key={t} 
            onClick={() => { setActiveTab(t); setIsAnalyzing(false); }} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all tracking-widest border ${
              activeTab === t 
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
            }`}
          >
            {t === 'logs' ? 'AUDIT LOGS' : t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl min-h-[400px]">
        {activeTab === 'password' && (
          <div className="space-y-8 animate-in zoom-in duration-300">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Entrée de test</label>
              <input 
                type="text" 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)} 
                placeholder="Vérifiez la force de votre mot de passe..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white font-mono text-xl focus:outline-none focus:border-emerald-500/50 shadow-inner" 
              />
            </div>
            {pwdStats && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Indice de sécurité</p>
                  <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-4">
                    <div className={`h-full transition-all duration-1000 ${pwdStats.score > 70 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : pwdStats.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pwdStats.score}%` }} />
                  </div>
                  <p className="text-3xl font-black text-white">{pwdStats.score}%</p>
                  <p className="text-xs text-emerald-400 font-bold mt-2 italic">Résistance : {pwdStats.timeLabel}</p>
                </div>
                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <CheckItem active={pwdStats.checks.length} label="Longueur (12+)" />
                  <CheckItem active={pwdStats.checks.upper} label="Majuscules" />
                  <CheckItem active={pwdStats.checks.number} label="Chiffres" />
                  <CheckItem active={pwdStats.checks.special} label="Caractères spéciaux" />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Analyse d'URL</label>
              <button onClick={() => setLinkUrl(SAMPLES.SUSPICIOUS_URL)} className="text-[9px] font-bold text-emerald-400 hover:underline">Utiliser un exemple</button>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={linkUrl} 
                onChange={(e)=>setLinkUrl(e.target.value)} 
                placeholder="https://votre-lien-suspect.com" 
                className="flex-grow bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" 
              />
              <button 
                onClick={handleLinkAnalysis} 
                disabled={isAnalyzing || !linkUrl} 
                className="bg-emerald-500 text-slate-950 font-black px-8 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
              >
                {isAnalyzing ? '...' : 'ANALYSIS'}
              </button>
            </div>
            {linkResult && (
              <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-slate-800 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`text-2xl font-black uppercase ${linkResult.riskScore > 60 ? 'text-red-500' : 'text-emerald-400'}`}>
                      {linkResult.verdict || "Analyse terminée"}
                    </h4>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Verdict de l'Intelligence Artificielle</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-4xl font-black tabular-nums ${linkResult.riskScore > 60 ? 'text-red-500' : 'text-white'}`}>
                      {linkResult.riskScore ?? 0}%
                    </span>
                    <p className="text-[10px] font-black text-slate-600 uppercase">Risk Level</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Points d'attention :</p>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {linkResult.reasons?.map((r: any, i: number) => <li key={i} className="flex items-start space-x-2"><span className="text-emerald-500">›</span><span>{r}</span></li>)}
                    </ul>
                  </div>
                  <div className="bg-slate-900/80 p-6 rounded-2xl border border-emerald-500/10">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Recommandation :</p>
                    <p className="text-sm italic text-slate-300 leading-relaxed">"{linkResult.recommendation}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Contenu du message</label>
              <button onClick={() => setEmailText(SAMPLES.BANK_PHISH)} className="text-[9px] font-bold text-purple-400 hover:underline">Charger exemple Phishing</button>
            </div>
            <textarea 
              value={emailText} 
              onChange={(e)=>setEmailText(e.target.value)} 
              placeholder="Collez le texte de l'email suspect ici pour analyse sémantique..." 
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 resize-none shadow-inner" 
            />
            <button 
              onClick={handleEmailAnalysis} 
              disabled={isAnalyzing || !emailText} 
              className="w-full bg-purple-600 text-white font-black py-4 rounded-xl hover:bg-purple-500 transition-all disabled:opacity-50 uppercase text-xs tracking-[0.3em]"
            >
              {isAnalyzing ? 'ANALYSE EN COURS...' : 'DÉTECTER HAMEÇONNAGE'}
            </button>
            {emailResult && (
              <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl animate-in zoom-in">
                <div className="flex justify-between items-center mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${emailResult.isSafe ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                    {emailResult.isSafe ? 'LÉGITIME' : 'ALERTE PHISHING'}
                  </span>
                  <span className="text-2xl font-black text-white">{emailResult.threatScore}/100</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic mb-6">"{emailResult.analysis}"</p>
                <div className="flex flex-wrap gap-2">
                  {emailResult.detectedTechniques?.map((t: string, i: number) => (
                    <span key={i} className="bg-slate-900 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-slate-800">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ddos' && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Logs de Trafic Réseau</label>
              <button onClick={() => setDdosText(SAMPLES.DDOS_TRAFFIC)} className="text-[9px] font-bold text-cyan-400 hover:underline">Simuler Attaque</button>
            </div>
            <TrafficGraph data={ddosText} />
            <textarea 
              value={ddosText} 
              onChange={(e)=>setDdosText(e.target.value)} 
              placeholder="Ex: [Timestamp] IN: 12000 pps..." 
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-cyan-400 font-mono text-[10px] focus:outline-none focus:border-cyan-500/50 shadow-inner" 
            />
            <button 
              onClick={handleDdosAnalysis} 
              disabled={isAnalyzing || !ddosText} 
              className="w-full bg-cyan-600 text-slate-950 font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-cyan-500 transition-all"
            >
              {isAnalyzing ? 'TRAITEMENT DES PACKETS...' : 'ANALYSE DU TRAFIC'}
            </button>
            {ddosResult && (
              <div className={`p-6 rounded-2xl border ${ddosResult.isAttack ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'} animate-in slide-in-from-bottom-2`}>
                <div className="flex justify-between mb-4">
                  <p className={`font-black uppercase tracking-widest ${ddosResult.isAttack ? 'text-red-500' : 'text-emerald-400'}`}>
                    {ddosResult.attackType || 'Flux Normal'}
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase">{ddosResult.severity} Severity</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Patterns Détectés</p>
                    <ul className="text-[10px] text-slate-400 space-y-1">
                      {ddosResult.patterns?.map((p: any, i: number) => <li key={i}>• {p}</li>)}
                    </ul>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-[9px] font-black text-emerald-400 uppercase mb-2">Mitigation</p>
                    <ul className="text-[10px] text-slate-300 space-y-1">
                      {ddosResult.mitigationSteps?.map((s: any, i: number) => <li key={i}>{i+1}. {s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Audit de Logs IA</label>
              <button onClick={() => setLogsText(SAMPLES.SYSLOG_SAMPLE)} className="text-[9px] font-bold text-orange-400 hover:underline">Charger logs SSH suspects</button>
            </div>
            <textarea 
              value={logsText} 
              onChange={(e)=>setLogsText(e.target.value)} 
              placeholder="Collez vos logs système, SSH, ou web pour un audit de sécurité intelligent..." 
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-orange-200 text-xs font-mono focus:outline-none focus:border-orange-500/50 resize-none shadow-inner" 
            />
            <button 
              onClick={handleLogsAnalysis} 
              disabled={isAnalyzing || !logsText} 
              className="w-full bg-orange-600 text-white font-black py-4 rounded-xl hover:bg-orange-500 transition-all disabled:opacity-50 uppercase text-xs tracking-widest"
            >
              {isAnalyzing ? 'AUDIT EN COURS...' : 'LANCER L\'AUDIT IA'}
            </button>
            {logsResult && (
              <div className="p-8 bg-slate-950/80 rounded-[2rem] border border-orange-500/20 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start border-b border-orange-500/10 pb-4">
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Rapport d'Audit</h4>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Sévérité : {logsResult.severity || "Indéterminée"}</p>
                  </div>
                  <span className="text-4xl">🕵️‍♂️</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">"{logsResult.summary}"</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Menaces Identifiées :</p>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {logsResult.threats?.map((t: string, i: number) => <li key={i} className="flex items-start space-x-2"><span className="text-orange-500">⚠</span><span>{t}</span></li>)}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Mesures de Protection :</p>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {logsResult.recommendations?.map((r: string, i: number) => <li key={i} className="flex items-start space-x-2"><span className="text-emerald-500">🛡</span><span>{r}</span></li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ active: boolean, label: string }> = ({ active, label }) => (
  <div className={`flex items-center space-x-3 text-[11px] font-black uppercase tracking-tight transition-colors ${active ? 'text-emerald-400' : 'text-slate-700'}`}>
    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${active ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-slate-800'}`}>
      {active ? '✓' : ''}
    </div>
    <span>{label}</span>
  </div>
);

export default SecurityTools;
