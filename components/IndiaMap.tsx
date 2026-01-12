
import React, { useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Maximize2, RotateCw, Move, Target } from 'lucide-react';
import { AggregatedData } from '../types';

interface IndiaMapProps {
  data: AggregatedData;
  activeCategory: string | null;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({ data, activeCategory }) => {
  const [rotation, setRotation] = useState({ x: 60, z: -20 });
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setRotation(prev => ({
      x: Math.max(30, Math.min(85, prev.x - e.movementY * 0.4)),
      z: prev.z + e.movementX * 0.4
    }));
  };

  const width = 800;
  const height = 800;
  
  const projection = d3.geoMercator()
    .center([82, 22])
    .scale(1700)
    .translate([width / 2, height / 2]);

  const colorHex = useMemo(() => {
    if (activeCategory === 'BIOMETRIC') return '#f59e0b';
    if (activeCategory === 'DEMOGRAPHIC') return '#a855f7';
    return '#00f2ff';
  }, [activeCategory]);

  return (
    <div 
      className="relative w-full h-full glass-tactical rounded-3xl border border-cyan-500/10 overflow-hidden select-none cursor-crosshair"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-6 left-8 z-50 pointer-events-none">
        <h2 className="header-font text-xl font-black text-white tracking-widest flex items-center gap-3">
          <Target size={20} className="text-cyan-400" />
          GEOINT COMMAND <span className="text-cyan-400 font-normal opacity-40 ml-2">AXIS: {rotation.z.toFixed(0)}</span>
        </h2>
      </div>

      <div className="absolute top-6 right-8 z-50 flex gap-2">
         <div className="px-3 py-1 bg-black/40 border border-white/5 rounded text-[9px] font-bold text-slate-500 flex items-center gap-2">
           <Move size={12}/> DRAG ROTATE
         </div>
      </div>

      <div className="orbital-view">
        <div 
          className="map-base-3d"
          style={{ transform: `rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)` }}
        >
          {/* Ground Plate */}
          <div className="absolute inset-0 border border-cyan-500/20 rounded-full bg-cyan-500/[0.02]" />
          
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full opacity-60">
            {/* India Boundary */}
            <path 
              d="M 300,50 L 320,60 L 360,70 L 400,100 L 430,150 L 480,220 L 520,280 L 460,320 L 410,380 L 360,550 L 300,650 L 240,550 L 200,420 L 120,320 L 60,280 L 100,200 L 140,120 L 200,80 Z" 
              fill="rgba(0, 242, 255, 0.03)"
              stroke="rgba(0, 242, 255, 0.15)"
              strokeWidth="2"
            />
          </svg>

          {/* 3D Volumetric Pillars */}
          {data.pincodeNodes.map((p, i) => {
            const [x, y] = projection([p.lng, p.lat]) || [0, 0];
            const volume = p.intensity;
            const h = (volume / 5000) * 280 + 10;
            const s = 6 + (volume / 5000) * 8;
            
            return (
              <div 
                key={i}
                className="cube"
                style={{ 
                  left: x, 
                  top: y, 
                  width: s, 
                  height: h,
                  color: colorHex,
                  transform: `translate(-50%, -100%) rotateX(-90deg)`,
                  zIndex: Math.floor(y) // Basic depth sorting
                } as any}
              >
                {/* 3 Faces for real volume */}
                <div className="face face-front" style={{ '--height': `${h}px`, '--size': `${s}px` } as any} />
                <div className="face face-right" style={{ '--height': `${h}px`, '--size': `${s}px` } as any} />
                <div className="face face-top" style={{ '--height': `${h}px`, '--size': `${s}px` } as any} />
                
                {volume > 4700 && (
                  <div 
                    className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black px-2 py-0.5 border border-white/10 text-[7px] font-bold text-white uppercase"
                    style={{ transform: `rotateX(0deg)` }}
                  >
                    {p.district}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-6 left-8 text-[8px] font-mono text-cyan-500/30 uppercase tracking-[0.3em]">
        National Registry Visualization // Buffer 0x729 // Stable
      </div>
    </div>
  );
};
