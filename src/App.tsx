/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Copy, 
  Trash2, 
  Download, 
  Printer, 
  Lock, 
  Eye, 
  EyeOff, 
  WifiOff, 
  AlertTriangle,
  Info,
  ChevronDown,
  Github,
  Key,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generatePassword, 
  calculateEntropy, 
  getStrengthLabel, 
  GeneratorMode, 
  CapitalizationMode, 
  GeneratorOptions 
} from './lib/cryptoUtils';

export default function App() {
  const [options, setOptions] = useState<GeneratorOptions>({
    mode: GeneratorMode.HUMAN_READABLE,
    wordCount: 4,
    includeNumbers: true,
    includeSymbols: false,
    capitalization: CapitalizationMode.TITLECASE,
    separator: '-',
    excludeConfusing: true,
    length: 16
  });

  const [password, setPassword] = useState("");
  const [entropy, setEntropy] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [autoClearMinutes, setAutoClearMinutes] = useState(5);
  const [activeTab, setActiveTab] = useState<'generator' | 'security' | 'about'>('generator');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleGenerate = useCallback(() => {
    const newPass = generatePassword(options);
    setPassword(newPass);
    setEntropy(calculateEntropy(newPass, options));
    
    // Clear existing timer
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Set auto-clear timer
    if (autoClearMinutes > 0) {
      timerRef.current = setTimeout(() => {
        setPassword("");
        setEntropy(0);
      }, autoClearMinutes * 60 * 1000);
    }
  }, [options, autoClearMinutes]);

  useEffect(() => {
    handleGenerate();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleGenerate]);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const clearClipboard = async () => {
    try {
       await navigator.clipboard.writeText("");
       alert("Clipboard cleared.");
    } catch (err) {
       console.error("Failed to clear clipboard", err);
    }
  };

  const handleExportTxt = () => {
    const blob = new Blob([password], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultphrase-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const data = {
      app: "VaultPhrase",
      timestamp: new Date().toISOString(),
      password,
      entropy,
      strength: getStrengthLabel(entropy).label,
      options
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultphrase-backup-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const strength = getStrengthLabel(entropy);

  return (
    <div className="h-screen flex flex-col font-sans selection:bg-terminal/30 selection:text-terminal overflow-hidden border-4 border-border">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-surface no-print shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-terminal/10 border border-terminal flex items-center justify-center rounded-md">
            <Shield className="text-terminal w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            VAULT<span className="text-terminal">PHRASE</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">v1.0.4</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('generator')}
            className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'generator' ? 'text-terminal' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Generator
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'security' ? 'text-terminal' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Security Guide
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === 'about' ? 'text-terminal' : 'text-slate-500 hover:text-slate-300'}`}
          >
            About
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-terminal/10 border border-terminal/20 rounded-full">
            <div className="w-2 h-2 bg-terminal rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-[10px] font-bold text-terminal uppercase tracking-widest">Offline Mode Active</span>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-slate-500 border-l border-white/5 pl-6">
            <span>AES-256 LOCAL</span>
            <span>BIP-39 COMPLIANT</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'generator' && (
            <div className="flex w-full h-full">
              {/* Sidebar Settings */}
              <aside className="hidden lg:flex w-80 bg-surface border-r border-white/5 p-6 flex-col gap-8 no-print shrink-0 overflow-y-auto custom-scrollbar">
                <section>
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Generation Mode</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: GeneratorMode.HUMAN_READABLE, label: 'Human-Readable' },
                      { id: GeneratorMode.SEED_PHRASE, label: 'Seed Phrase Style' },
                      { id: GeneratorMode.RANDOM_CHARS, label: 'Random Character' },
                      { id: GeneratorMode.DICEWARE, label: 'Diceware Mode' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setOptions({ ...options, mode: mode.id as GeneratorMode })}
                        className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all border ${options.mode === mode.id ? 'bg-terminal text-black border-terminal' : 'bg-white/2 text-slate-400 border-white/5 hover:border-white/10'}`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Parameters</h2>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[11px] font-bold">
                        <label className="text-slate-400 uppercase tracking-wider">{options.mode === GeneratorMode.RANDOM_CHARS ? 'Length' : 'Word Count'}</label>
                        <span className="text-terminal font-mono">{options.mode === GeneratorMode.RANDOM_CHARS ? options.length : options.wordCount}</span>
                      </div>
                      <input 
                        type="range"
                        min={options.mode === GeneratorMode.RANDOM_CHARS ? 8 : 2}
                        max={options.mode === GeneratorMode.RANDOM_CHARS ? 64 : 12}
                        value={options.mode === GeneratorMode.RANDOM_CHARS ? options.length : options.wordCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (options.mode === GeneratorMode.RANDOM_CHARS) {
                            setOptions({...options, length: val});
                          } else {
                            setOptions({...options, wordCount: val});
                          }
                        }}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-terminal"
                      />
                    </div>

                    {options.mode !== GeneratorMode.RANDOM_CHARS && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Separator</label>
                          <select 
                            value={options.separator}
                            onChange={(e) => setOptions({...options, separator: e.target.value})}
                            className="bg-slate-900 border border-slate-700/50 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-terminal/50 transition-colors"
                          >
                            <option value="-">Hyphen (-)</option>
                            <option value="_">Underscore (_)</option>
                            <option value=".">Period (.)</option>
                            <option value=" ">Space ( )</option>
                            <option value="">None</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Casing</label>
                          <select 
                            value={options.capitalization}
                            onChange={(e) => setOptions({...options, capitalization: e.target.value as CapitalizationMode})}
                            className="bg-slate-900 border border-slate-700/50 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-terminal/50 transition-colors"
                          >
                            <option value={CapitalizationMode.TITLECASE}>TitleCase</option>
                            <option value={CapitalizationMode.LOWERCASE}>lowercase</option>
                            <option value={CapitalizationMode.UPPERCASE}>UPPERCASE</option>
                            <option value={CapitalizationMode.RANDOM}>rAnDoM</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 pt-2 text-[11px] font-medium text-slate-400">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={options.includeNumbers}
                          onChange={(e) => setOptions({...options, includeNumbers: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-terminal" 
                        />
                        <span className="group-hover:text-slate-200 transition-colors">Include Numbers</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={options.includeSymbols}
                          onChange={(e) => setOptions({...options, includeSymbols: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-terminal" 
                        />
                        <span className="group-hover:text-slate-200 transition-colors">Include Symbols</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={options.excludeConfusing}
                          onChange={(e) => setOptions({...options, excludeConfusing: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-terminal" 
                        />
                        <span className="group-hover:text-slate-200 transition-colors">Exclude Confusing (0, O, l, I)</span>
                      </label>
                    </div>
                  </div>
                </section>

                <div className="mt-auto pt-6 border-t border-white/5 no-print">
                   <div className="bg-amber-900/10 border border-amber-900/30 rounded-xl p-4 text-[11px] leading-relaxed text-amber-200/60">
                      <p className="font-bold mb-1 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle size={12} className="text-amber-500" />
                        Security Warning
                      </p>
                      Never share your secrets. This app generates all tokens in-memory. 
                      Clearing cache or refresh wipes all active traces.
                   </div>
                </div>
              </aside>

              {/* Right Content Section */}
              <section className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto bg-gradient-to-br from-dark to-[#121216]">
                <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full mb-10">
                  <div className="flex items-end justify-between mb-4">
                    <h3 className="text-[10px] font-mono text-terminal uppercase tracking-[0.3em] font-bold">Secure Vault Output</h3>
                    <div className="flex gap-6 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                      <span>Entropy: <span className="text-slate-300">{entropy} bits</span></span>
                      <span>Strength: <span className={strength.color}>{strength.label}</span></span>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-1 bg-terminal/10 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-surface border border-slate-800 rounded-2xl p-12 min-h-[180px] flex items-center justify-center text-center shadow-2xl ring-1 ring-white/5 transition-all group-hover:border-slate-700">
                      <div className={`text-4xl md:text-5xl lg:text-6xl font-mono font-bold tracking-tight transition-all duration-300 selection:bg-terminal selection:text-black ${showPassword ? 'text-white' : 'text-white/5 blur-2xl select-none'}`}>
                        {password || "••••••••••••"}
                      </div>
                      
                      <div className="absolute bottom-6 right-6 flex gap-3 no-print">
                        <button 
                          onClick={copyToClipboard}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-lg border border-white/5"
                        >
                          {isCopied ? <ShieldCheck size={16} className="text-terminal" /> : <Copy size={16} />}
                          {isCopied ? "COPIED" : "COPY"}
                        </button>
                        <button 
                          onClick={handleGenerate}
                          className="bg-terminal hover:bg-emerald-400 text-black px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                          <RefreshCw size={16} />
                          REGENERATE
                        </button>
                      </div>

                      <div className="absolute top-6 right-6 flex gap-2 no-print">
                         <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-2.5 bg-white/5 text-slate-500 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                            title="Toggle Visibility"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button 
                            onClick={() => setPassword("")}
                            className="p-2.5 bg-red-900/10 text-red-500/60 rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-all"
                            title="Purge Output"
                          >
                            <Trash2 size={18} />
                          </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Strength Bar */}
                  <div className="mt-8 grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((seg) => {
                      const isActive = (entropy / 100) * 4 >= seg;
                      return (
                        <div 
                          key={seg} 
                          className={`rounded-full transition-all duration-500 ${isActive ? (strength.color.includes('green') || strength.color.includes('emerald') ? 'bg-terminal' : strength.color.includes('red') ? 'bg-red-500' : 'bg-yellow-500') : 'bg-white/5'}`} 
                        />
                      );
                    })}
                  </div>

                  {/* Desktop Quick Tools */}
                  <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 no-print">
                    <div className="bg-white/2 p-5 border border-white/5 rounded-xl flex flex-col gap-2 group hover:border-white/10 transition-colors">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">Auto-Clear Memory</span>
                      <div className="flex justify-between items-center text-sm font-mono">
                        <span className="text-slate-300">{autoClearMinutes > 0 ? `${autoClearMinutes}:00 MIN` : 'DISABLED'}</span>
                        <div className="flex items-center gap-2">
                           <select 
                            value={autoClearMinutes}
                            onChange={(e) => setAutoClearMinutes(parseInt(e.target.value))}
                            className="text-terminal text-[10px] hover:underline uppercase bg-transparent outline-none cursor-pointer"
                           >
                            <option value={0}>OFF</option>
                            <option value={1}>1M</option>
                            <option value={5}>5M</option>
                            <option value={15}>15M</option>
                           </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/2 p-5 border border-white/5 rounded-xl flex flex-col gap-2 group hover:border-white/10 transition-colors">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">Export Vault</span>
                      <div className="flex justify-between items-center text-sm font-mono">
                        <span className="text-slate-300">VAULT.JSON</span>
                        <button onClick={handleExportJson} className="text-terminal text-[10px] hover:underline uppercase font-bold">Download</button>
                      </div>
                    </div>

                    <div className="bg-white/2 p-5 border border-white/5 rounded-xl flex flex-col gap-2 group hover:border-white/10 transition-colors">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">Physical Backup</span>
                      <div className="flex justify-between items-center text-sm font-mono">
                        <span className="text-slate-300">HARD COPY</span>
                        <button onClick={() => window.print()} className="text-terminal text-[10px] hover:underline uppercase font-bold">Print Card</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <footer className="mt-auto border-t border-white/5 pt-8 no-print shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-100 uppercase tracking-widest">Privacy Shield Protocol</h4>
                      <div className="flex flex-wrap gap-2">
                        {['No Trackers', 'Local Entropy', 'Zero Network Traffic', 'Browser-Only PRNG'].map(badge => (
                          <span key={badge} className="px-3 py-1 bg-terminal/5 text-terminal rounded border border-terminal/20 text-[9px] uppercase font-bold tracking-tight">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-6 text-right">
                       <div className="hidden sm:block">
                          <p className="text-[10px] text-slate-500 leading-tight uppercase font-bold mb-1">Advanced Safety Tip</p>
                          <p className="text-[11px] text-slate-400">Never take digital photos or screenshots. Paper is the ultimate offline barrier.</p>
                       </div>
                       <div 
                        onClick={() => setActiveTab('about')}
                        className="w-10 h-10 border border-slate-700 rounded-full flex items-center justify-center text-slate-500 cursor-pointer hover:text-white hover:border-white hover:bg-white/5 transition-all shrink-0"
                       >
                         <Info size={18} />
                       </div>
                    </div>
                  </div>
                </footer>
              </section>
            </div>
          )}

          {activeTab === 'security' && (
            <motion.div 
               key="security"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="flex-1 overflow-y-auto p-12 bg-gradient-to-br from-dark to-[#121216]"
            >
               <div className="max-w-4xl mx-auto space-y-16">
                  <section>
                    <h2 className="text-terminal terminal-glow text-4xl font-bold flex items-center gap-4">
                      <ShieldCheck size={40} /> Security Architecture
                    </h2>
                    <p className="text-xl text-slate-400 leading-relaxed mt-6 max-w-2xl">
                      VaultPhrase is engineered for total isolation. By executing 100% locally in your browser context, we eliminate the primary attack vectors for credential theft.
                    </p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="p-8 bg-white/2 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="text-white text-lg font-bold flex items-center gap-3">
                        <Lock size={18} className="text-terminal" /> Cryptographic Integrity
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Entropy is sourced via <code>CSPRNG</code> (Cryptographically Secure Pseudo-Random Number Generation). This makes generated phrases mathematically unpredictable and resistant to statistical analysis.
                      </p>
                    </div>

                    <div className="p-8 bg-white/2 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="text-white text-lg font-bold flex items-center gap-3">
                        <WifiOff size={18} className="text-terminal" /> Network Purgatory
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Once the application is loaded, you can physically disconnect from the internet. All logic paths are bundled into the artifact. Zero telemetry means zero leaks.
                      </p>
                    </div>

                    <div className="p-8 bg-white/2 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="text-white text-lg font-bold flex items-center gap-3">
                        <RefreshCw size={18} className="text-terminal" /> Volatile States
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Generated keys exist only in active browser memory. We avoid <code>localStorage</code> or <code>IndexedDB</code> to prevent persistent local forensic recovery after the session is closed.
                      </p>
                    </div>

                    <div className="p-8 bg-white/2 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="text-white text-lg font-bold flex items-center gap-3">
                        <Printer size={18} className="text-terminal" /> Hard-Copy Legacy
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        In an era of digital surveillance, paper remains a tier-1 encryption layer. Use our print formatted sheets for long-term vault storage in physical lockers.
                      </p>
                    </div>
                  </div>

                  <div className="bg-terminal/5 border border-terminal/20 p-10 rounded-3xl space-y-6">
                    <h4 className="text-terminal font-bold uppercase tracking-[0.3em] text-xs">Standard Operating Procedures</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300 font-medium">
                      <div className="flex gap-3 items-start"><span className="text-terminal">01.</span> Use a minimum of 4 words for passphrases.</div>
                      <div className="flex gap-3 items-start"><span className="text-terminal">02.</span> Never use the same phrase for financial and social accounts.</div>
                      <div className="flex gap-3 items-start"><span className="text-terminal">03.</span> Enable Hardware 2FA (U2F) on all critical endpoints.</div>
                      <div className="flex gap-3 items-start"><span className="text-terminal">04.</span> Physically purge recovery sheets before disposal.</div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'about' && (
             <motion.div 
               key="about"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="flex-1 flex flex-col items-center justify-center p-12 bg-[#0a0a0c]"
             >
                <div className="max-w-2xl w-full text-center space-y-12">
                   <div className="relative inline-block">
                     <div className="absolute inset-0 bg-terminal blur-3xl opacity-20 animate-pulse"></div>
                     <div className="relative w-24 h-24 bg-surface border-2 border-terminal/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3">
                        <Shield size={48} className="text-terminal" />
                     </div>
                   </div>
                   
                   <div className="space-y-4">
                     <h2 className="text-5xl font-black text-white tracking-tighter">VAULT<span className="text-terminal">PHRASE</span></h2>
                     <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Version 1.0.4.Beta (Security Build)</p>
                   </div>

                   <p className="text-slate-400 leading-relaxed text-lg italic">
                     \"Privacy is not a feature; it is a fundamental human right. VaultPhrase was built to give users control over their entropy without compromise.\"
                   </p>

                   <div className="grid grid-cols-3 gap-12 pt-8 border-t border-white/5">
                      <div className="space-y-1">
                        <div className="text-white font-bold">1024</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Wordlist Size</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-white font-bold">SHA-256</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Entropy Hash</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-white font-bold">MIT</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">License</div>
                      </div>
                   </div>

                   <div className="flex justify-center gap-4 pt-10">
                      <a href="#" className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">PROJECT SOURCE</a>
                      <button onClick={() => setActiveTab('generator')} className="px-8 py-3 bg-terminal text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-terminal">LAUNCH SECURITY CORE</button>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Print View Layout */}
      <div className="print-only p-20 text-black min-h-screen bg-white">
         <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">VAULT PHRASE <span className="text-gray-400">RECOVERY</span></h1>
            <div className="text-right text-[10px] font-mono">
               <div>SECURITY CLEARANCE: 1-ALPHA</div>
               <div>DATE: {new Date().toLocaleDateString()}</div>
            </div>
         </div>

         <div className="border-4 border-black p-12 relative">
            <div className="absolute top-4 right-4 text-[8px] font-mono text-gray-300">VAULT KEY ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
            <div className="mb-10">
               <span className="text-[10px] uppercase font-black bg-black text-white px-2 py-1">MASTER PASSPHRASE</span>
               <div className="text-4xl font-mono mt-6 leading-tight break-all border-b border-black pb-4">{password}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
               <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Generation Parameters</span>
                  <ul className="text-xs mt-4 space-y-1 font-mono uppercase">
                     <li>Entropy: {entropy} BITS</li>
                     <li>Strength: {strength.label}</li>
                     <li>Mode: {options.mode}</li>
                  </ul>
               </div>
               <div className="text-right">
                  <div className="inline-block w-24 h-24 border-2 border-black/10 flex items-center justify-center text-[8px] font-mono uppercase text-gray-300">
                    [SECURE LOGO AREA]
                  </div>
               </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-black border-dashed">
               <span className="text-[10px] uppercase font-black">SECURITY COVENANT</span>
               <p className="text-[11px] mt-4 leading-relaxed font-serif">
                 This document is a physical asset. If lost or stolen, consider all associated funds and data compromised immediately. 
                 Do not store this sheet in a shared location. Do not scan, photocopy, or digitize this image. 
                 Destruction of this asset must be total.
               </p>
            </div>
         </div>
         
         <div className="mt-12 grid grid-cols-3 gap-6 opacity-20">
            {Array.from({length: 3}).map((_, i) => (
              <div key={i} className="h-24 border border-black border-dashed flex items-center justify-center text-[10px] font-mono rotate-1">
                ATTACH PHYSICAL OTP HERE
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
