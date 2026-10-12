import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Fan, Flame, Wind, Zap, Clock, Power } from 'lucide-react';

const DEVICE_ICONS = {
  Light: Lightbulb,
  Fan: Fan,
  'Air Fryer': Flame,
  AC: Wind,
};

function formatRuntime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  const displayMins = mins % 60;
  return `${String(hrs).padStart(2, '0')}:${String(displayMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function DeviceSwitchCard({ appliance, onToggle }) {
  const Icon = DEVICE_ICONS[appliance.name] || Zap;
  const isOn = appliance.state === 'ON';

  // Local active timer
  const [activeSeconds, setActiveSeconds] = useState(0);

  useEffect(() => {
    let timer;
    if (isOn) {
      timer = setInterval(() => {
        setActiveSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOn]);

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl glass-panel p-4 transition-all duration-300 border flex flex-col justify-between ${
        isOn
          ? 'border-cyan-400/40 shadow-cyan-glow bg-cyan-500/[0.04]'
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      {/* Top row: Icon + Status badge */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isOn
              ? 'bg-cyan-400/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
              : 'bg-space-800 text-slate-400'
          }`}
        >
          <Icon className={`w-4 h-4 ${isOn ? 'animate-pulse-slow' : ''}`} />
        </div>

        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
            isOn
              ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30 font-semibold'
              : 'bg-slate-800/60 text-slate-400 border-white/5'
          }`}
        >
          {isOn ? '● ACTIVE' : '○ STANDBY'}
        </span>
      </div>

      {/* Appliance Name & Rating */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-white tracking-wide font-sans">{appliance.name}</h3>
        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-mono">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>{appliance.powerRating}W Rating</span>
        </div>
      </div>

      {/* Metrics Row: Runtime & Active Power draw */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{formatRuntime(activeSeconds)}</span>
        </div>
        <div className={`font-semibold ${isOn ? 'text-amber-300' : 'text-slate-400'}`}>
          {isOn ? `${appliance.powerRating}W` : '0W'}
        </div>
      </div>

      {/* Toggle Action Switch */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => onToggle(appliance.name)}
        className={`w-full py-2 px-3 rounded-xl flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase transition-all cursor-pointer ${
          isOn
            ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-space-950 shadow-cyan-glow font-bold'
            : 'bg-space-800 hover:bg-space-700 text-slate-300 border border-white/10'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Power className="w-3 h-3" />
          <span>{isOn ? 'Turn OFF' : 'Turn ON'}</span>
        </div>

        {/* Switch Thumb Indicator */}
        <div
          className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${
            isOn ? 'bg-space-950/40' : 'bg-slate-700'
          }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${
              isOn ? 'translate-x-3.5' : 'translate-x-0'
            }`}
          />
        </div>
      </motion.button>
    </motion.div>
  );
}
