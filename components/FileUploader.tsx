
import React, { useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Info, Database } from 'lucide-react';
import { DataType, FileState } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  files: FileState[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isProcessing, files }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Upload Zone */}
      <div className="lg:col-span-7">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Ingest National Datasets</h2>
          <p className="text-slate-400">Securely process multi-million row CSV files for biometric, demographic and enrollment trends.</p>
        </div>

        <div 
          onClick={() => !isProcessing && inputRef.current?.click()}
          className={`
            relative h-80 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-12 cursor-pointer
            ${isProcessing ? 'border-blue-500/20 bg-blue-500/5' : 'border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 bg-slate-900/50'}
          `}
        >
          <input 
            type="file" 
            ref={inputRef} 
            onChange={handleFileChange} 
            multiple 
            accept=".csv"
            className="hidden" 
          />
          
          <div className="p-6 bg-blue-500/10 rounded-full mb-6">
            {isProcessing ? (
              <Loader2 size={48} className="text-blue-500 animate-spin" />
            ) : (
              <Upload size={48} className="text-blue-500" />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              {isProcessing ? 'Processing Intelligence...' : 'Drop CSV Folders or Files'}
            </h3>
            <p className="text-slate-400 max-w-sm">
              Supporting Biometric (4 files), Demographic (5 files), and Enrollment (3 files) datasets.
            </p>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-50">
            <div className="flex items-center gap-2 text-xs">
              <FileText size={14} />
              <span>UTF-8 CSV Only</span>
            </div>
            <div className="text-xs">Max 2GB / Total</div>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-4 p-4 glass rounded-xl">
          <Info size={20} className="text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Architecture Note</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our edge-processing engine aggregates 5,0,000+ rows per file using streaming buffers to ensure zero UI lag while calculating national trends.
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">Processing Queue</h3>
          <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">
            {files.length} ITEMS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px] pr-2">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 glass rounded-xl border border-dashed border-slate-800 opacity-50">
              <Database size={32} className="text-slate-600 mb-3" />
              <p className="text-sm">Queue Empty</p>
            </div>
          ) : (
            files.map((file, idx) => (
              <div key={idx} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    file.type === DataType.BIOMETRIC ? 'bg-amber-500/10 text-amber-500' :
                    file.type === DataType.DEMOGRAPHIC ? 'bg-purple-500/10 text-purple-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">
                      {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isProcessing ? (
                    <Loader2 size={18} className="text-blue-500 animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} className="text-green-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
