
import React, { useState, useCallback } from 'react';
import { Database, TrendingUp, ShieldCheck, Cpu, Globe, Crosshair } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { DataType, AggregatedData, FileState } from './types';
import { processFiles } from './services/dataProcessor';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<AggregatedData | null>(null);
  const [view, setView] = useState<'upload' | 'dashboard'>('upload');

  const handleFileUpload = useCallback(async (newFiles: File[]) => {
    setIsProcessing(true);
    
    const fileStates: FileState[] = newFiles.map(f => {
      let type = DataType.ENROLLMENT;
      if (f.name.toLowerCase().includes('biometric')) type = DataType.BIOMETRIC;
      else if (f.name.toLowerCase().includes('demographic')) type = DataType.DEMOGRAPHIC;
      
      return {
        name: f.name,
        size: f.size,
        type,
        status: 'pending',
        progress: 0
      };
    });

    setFiles(fileStates);

    try {
      const result = await processFiles(newFiles, (progress) => {
        // Track overall progress logic if needed
      });
      // Simulate high-tech loading delay
      setTimeout(() => {
        setData(result);
        setView('dashboard');
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error("Processing failed", error);
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#02040a] text-[#cbd5e1] flex flex-col p-6">
      {/* Tactical Header */}
      <header className="flex items-center justify-between glass-tactical px-8 py-4 rounded-2xl border border-white/5 mb-6 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-600 rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] border border-cyan-400/50">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="header-font text-2xl font-black tracking-widest text-white italic">STRATOS <span className="text-cyan-400">COMMAND</span></h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                <Cpu size={12} className="text-cyan-500" />
                NEURAL CORE READY // SESSION 0xBF82
              </div>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <nav className="flex items-center gap-4">
            <NavBtn active={view === 'upload'} onClick={() => setView('upload')} icon={<Database size={16} />}>INGEST</NavBtn>
            <NavBtn active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<TrendingUp size={16} />}>TACTICAL</NavBtn>
          </nav>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden xl:flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-cyan-500" />
              NORTH SECTOR: CLEAR
            </div>
            <div className="flex items-center gap-2">
              <Crosshair size={14} className="text-rose-500" />
              ANOMALIES: 0
            </div>
          </div>
          <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span className="text-[9px] font-black text-green-500 tracking-[0.2em] uppercase">Tactical Link: Stable</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div className={`transition-all duration-700 ${view === 'upload' ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none absolute -translate-y-10'}`}>
          <FileUploader onFilesSelected={handleFileUpload} isProcessing={isProcessing} files={files} />
        </div>
        
        {view === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Dashboard data={data} />
          </div>
        )}
      </main>

      {/* Footer System Info */}
      <footer className="mt-6 flex justify-between items-center text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">
        <div>© 2025 STRATOS DEFENSE SYSTEMS // INTERNAL USE ONLY</div>
        <div className="flex gap-4">
          <span>ENCRYPT: AES-256-GCM</span>
          <span>AUTH: RSA-4096</span>
          <span className="text-cyan-500">READY</span>
        </div>
      </footer>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
      active 
      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[inset_0_0_15px_rgba(0,242,255,0.1)]' 
      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="text-xs font-bold tracking-widest">{children}</span>
  </button>
);

export default App;
