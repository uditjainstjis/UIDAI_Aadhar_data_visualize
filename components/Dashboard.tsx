
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Shield, Server, Database, TrendingUp, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { AggregatedData, DataType } from '../types';
import { IndiaMap } from './IndiaMap';
import { GoogleGenAI } from '@google/genai';

interface DashboardProps {
  data: AggregatedData | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<DataType | 'ALL'>('ALL');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!data) return null;

  const generateAiTrends = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Act as a senior social data analyst. Analyze this Indian demographic/biometric dataset summary:
      Total Count: ${data.totalCount}
      Age Groups: 0-5: ${data.ageGroups['0-5']}, 5-17: ${data.ageGroups['5-17']}, 18+: ${data.ageGroups['18+']}
      Top States: ${Object.keys(data.byState).join(', ')}
      Identify 3 potential social trends or areas requiring governmental focus based on these volumes. 
      Keep it professional, concise (max 150 words).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiReport(response.text || "Analysis failed to generate.");
    } catch (e) {
      setAiReport("Unable to connect to STRATOS AI core. Ensure API access is configured.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const trendData = useMemo(() => {
    return Object.entries(data.byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, val]) => ({ date, val }));
  }, [data]);

  const demographicData = useMemo(() => [
    { name: '0-5', value: data.ageGroups['0-5'], color: '#3b82f6' },
    { name: '5-17', value: data.ageGroups['5-17'], color: '#a855f7' },
    { name: '18+', value: data.ageGroups['18+'], color: '#f59e0b' },
  ], [data]);

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Metrics Column */}
      <div className="col-span-3 flex flex-col gap-5 overflow-y-auto pr-2 custom-scroll">
        <Panel title="Registry Status">
          <div className="mt-4">
            <MetricBlock 
              label="TOTAL ENTRIES" 
              value={(data.totalCount / 1000000).toFixed(1) + "M"} 
              sub="ACTIVE POOL"
              icon={<Shield size={16} className="text-cyan-400" />}
            />
            <div className="grid grid-cols-2 gap-2 mt-4">
               <MiniStat label="BIOMETRIC" value="4M+" color="amber" />
               <MiniStat label="ENROLL" value="6M+" color="blue" />
            </div>
          </div>
        </Panel>

        <Panel title="Social Engine AI">
          <div className="mt-4 space-y-4">
            {!aiReport ? (
              <button 
                onClick={generateAiTrends}
                disabled={isAnalyzing}
                className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[10px] font-bold text-cyan-400 flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                GENERATE SOCIAL TRENDS
              </button>
            ) : (
              <div className="text-[10px] text-slate-400 font-medium leading-relaxed italic animate-in fade-in">
                {aiReport}
                <button onClick={() => setAiReport(null)} className="block mt-2 text-cyan-500 underline uppercase tracking-widest text-[8px]">Reset Analysis</button>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Demographics">
           <div className="h-40 mt-2">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={demographicData} innerRadius={40} outerRadius={60} paddingAngle={10} dataKey="value">
                   {demographicData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="flex justify-around text-[9px] font-bold text-slate-500">
             {demographicData.map(d => <span key={d.name}>{d.name}</span>)}
           </div>
        </Panel>
      </div>

      {/* 3D Map Column */}
      <div className="col-span-6 relative">
         <IndiaMap data={data} activeCategory={activeTab === 'ALL' ? null : activeTab} />
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1 p-1 bg-black/80 backdrop-blur rounded-xl border border-white/10 z-50">
            <FilterBtn active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')}>OVERALL</FilterBtn>
            <FilterBtn active={activeTab === DataType.BIOMETRIC} onClick={() => setActiveTab(DataType.BIOMETRIC)}>BIOMETRIC</FilterBtn>
            <FilterBtn active={activeTab === DataType.DEMOGRAPHIC} onClick={() => setActiveTab(DataType.DEMOGRAPHIC)}>DEMOGRAPHIC</FilterBtn>
         </div>
      </div>

      {/* Analytics Column */}
      <div className="col-span-3 flex flex-col gap-5 overflow-y-auto pr-2 custom-scroll">
        <Panel title="Ingest Velocity">
           <div className="h-44 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trendData}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Area type="monotone" dataKey="val" stroke="#00f2ff" strokeWidth={1.5} fill="rgba(0, 242, 255, 0.05)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </Panel>

        <Panel title="Regional Density">
            <div className="space-y-3 mt-4">
                {Object.entries(data.byState).slice(0, 5).map(([name, s]: [string, any]) => (
                    <div key={name}>
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
                            <span>{name}</span>
                            <span className="text-white font-mono">{(s.total / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-0.5 w-full bg-slate-900 rounded-full">
                            <div className="h-full bg-cyan-500" style={{width: `${Math.min(100, (s.total / 120000) * 100)}%`}} />
                        </div>
                    </div>
                ))}
            </div>
        </Panel>

        <Panel title="System Specs">
            <div className="grid grid-cols-2 gap-2 mt-4">
                <AssetCard icon={<Database size={12}/>} label="STORE" val="4.2PB" />
                <AssetCard icon={<Server size={12}/>} label="NODES" val="120" />
            </div>
        </Panel>
      </div>
    </div>
  );
};

const Panel: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
  <div className="glass-tactical p-5 rounded-2xl border border-white/5">
    <h3 className="header-font text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">{title}</h3>
    {children}
  </div>
);

const MetricBlock: React.FC<{label: string, value: string, sub: string, icon: React.ReactNode}> = ({label, value, sub, icon}) => (
  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
    <div className="flex justify-between items-center mb-1">
        <span className="text-[8px] font-bold text-slate-500 tracking-widest">{label}</span>
        {icon}
    </div>
    <div className="text-3xl font-black text-white font-mono">{value}</div>
    <div className="text-[7px] font-bold text-cyan-500/40 uppercase mt-1">{sub}</div>
  </div>
);

const MiniStat: React.FC<{label: string, value: string, color: string}> = ({label, value, color}) => (
    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
        <div className="text-[7px] font-bold text-slate-500 uppercase">{label}</div>
        <div className={`text-xs font-bold font-mono text-${color}-400`}>{value}</div>
    </div>
);

const AssetCard: React.FC<{icon: React.ReactNode, label: string, val: string}> = ({icon, label, val}) => (
    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex flex-col items-center">
        <div className="text-cyan-400 mb-1">{icon}</div>
        <div className="text-[8px] text-white font-mono">{val}</div>
    </div>
);

const FilterBtn: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({active, onClick, children}) => (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-white'}`}>
        {children}
    </button>
);
