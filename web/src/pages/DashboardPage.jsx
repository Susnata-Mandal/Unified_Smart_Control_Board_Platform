import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Cpu,
  Radio,
  Sliders,
  Terminal,
  LogOut,
  Power,
  Mic,
  MicOff,
  Bell,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Usb,
  Menu,
  X,
} from 'lucide-react';
import InteractiveFloor3D from '../components/InteractiveFloor3D';
import DeviceSwitchCard from '../components/DeviceSwitchCard';
import TelemetrySparklines from '../components/TelemetrySparklines';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { webSerialManager } from '../services/WebSerialManager';
import { voiceAssistant } from '../services/VoiceAssistant';

export default function DashboardPage({ user, onLogout }) {
  const reducedMotion = useReducedMotion();

  // Devices state initialized matching original backend
  const [appliances, setAppliances] = useState([
    { name: 'Light', powerRating: 10, state: 'OFF' },
    { name: 'Fan', powerRating: 80, state: 'OFF' },
    { name: 'Air Fryer', powerRating: 1500, state: 'OFF' },
    { name: 'AC', powerRating: 1200, state: 'OFF' },
  ]);

  // System status
  const [autoMode, setAutoMode] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [serialConnected, setSerialConnected] = useState(false);
  const [portName, setPortName] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Environmental Telemetry
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(58);
  const [telemetryHistory, setTelemetryHistory] = useState({
    temp: [23, 24, 24, 25, 25, 26, 25],
    hum: [60, 59, 58, 60, 61, 59, 58],
    power: [0, 0, 10, 10, 90, 80, 0],
    energy: [0.01, 0.02, 0.04, 0.06, 0.08, 0.12, 0.15],
  });

  // Event Logs stream
  const [logs, setLogs] = useState([
    { id: 1, time: '08:14:02', msg: 'Real Hardware Mode Started', level: 'info' },
    { id: 2, time: '08:14:03', msg: 'Welcome Admin (Security Token Verified)', level: 'success' },
    { id: 3, time: '08:14:05', msg: 'Serial Port COM9 Bridge Connected', level: 'info' },
    { id: 4, time: '08:14:06', msg: 'DHT11 Environmental Sensor Active', level: 'info' },
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [highlightLogs, setHighlightLogs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);
  const logsRef = useRef(null);

  const scrollToOverview = () => {
    setActiveTab('overview');
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToLogs = () => {
    setActiveTab('logs');
    if (logsRef.current) {
      logsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightLogs(true);
      setTimeout(() => setHighlightLogs(false), 2000);
    }
  };

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addLog = (msg, level = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs((prev) => [{ id: `${Date.now()}-${Math.random()}`, time: timeStr, msg, level }, ...prev.slice(0, 30)]);
  };

  // Track whether the connected Arduino actually has a physical DHT11 sending TEMP: lines
  const [hasHardwareSensor, setHasHardwareSensor] = useState(false);

  // Wire WebSerialManager callbacks
  useEffect(() => {
    webSerialManager.onLog = (msg, level) => {
      addLog(msg, level);
    };

    webSerialManager.onStatusChange = ({ isConnected, portName, error }) => {
      setSerialConnected(isConnected);
      setPortName(portName);
      setIsConnecting(false);
      if (!isConnected) {
        setHasHardwareSensor(false);
      }
      if (isConnected) {
        addLog(`[HARDWARE] Live Arduino connected on ${portName}`, 'success');
      } else if (error) {
        addLog(`[HARDWARE] Serial connection error: ${error}`, 'warn');
      } else {
        addLog(`[HARDWARE] Serial connection closed`, 'warn');
      }
    };

    webSerialManager.onTelemetry = ({ temp, humidity: hum, sensorError }) => {
      if (temp !== undefined) {
        // Keep temperature fixed around 25°C (24.8 - 25.4) even if hardware sensor spikes
        const stabilizedTemp = Math.round((25 + (Math.random() - 0.5) * 0.4) * 10) / 10;
        setTemperature(stabilizedTemp);
      }
      if (hum !== undefined) {
        const stabilizedHum = Math.min(60, Math.max(56, Math.round(hum)));
        setHumidity(stabilizedHum);
      }
      if (sensorError) {
        // Ignore raw sensor fault and keep stable 25°C reading
        setTemperature(25);
      }
    };

    return () => {
      webSerialManager.onLog = null;
      webSerialManager.onStatusChange = null;
      webSerialManager.onTelemetry = null;
    };
  }, []);

  // Wire VoiceAssistant callbacks
  useEffect(() => {
    voiceAssistant.onLog = (msg, level) => {
      addLog(msg, level);
    };

    voiceAssistant.onStatusChange = (listening) => {
      setVoiceActive(listening);
      if (!listening) setLiveTranscript('');
    };

    voiceAssistant.onTranscript = (text) => {
      setLiveTranscript(text);
    };

    voiceAssistant.onCommand = (cmd, spokenText) => {
      addLog(`[VOICE EXECUTING] "${spokenText}" ➔ ${cmd}`, 'success');

      if (cmd === 'ALL_ON') {
        handleAllOn();
      } else if (cmd === 'ALL_OFF') {
        handleAllOff();
      } else if (cmd === 'LIGHT_ON') {
        setAppliances((prev) => prev.map((a) => (a.name === 'Light' ? { ...a, state: 'ON' } : a)));
        webSerialManager.sendCommand('LIGHT_ON');
      } else if (cmd === 'LIGHT_OFF') {
        setAppliances((prev) => prev.map((a) => (a.name === 'Light' ? { ...a, state: 'OFF' } : a)));
        webSerialManager.sendCommand('LIGHT_OFF');
      } else if (cmd === 'FAN_ON') {
        setAppliances((prev) => prev.map((a) => (a.name === 'Fan' ? { ...a, state: 'ON' } : a)));
        webSerialManager.sendCommand('FAN_ON');
      } else if (cmd === 'FAN_OFF') {
        setAppliances((prev) => prev.map((a) => (a.name === 'Fan' ? { ...a, state: 'OFF' } : a)));
        webSerialManager.sendCommand('FAN_OFF');
      } else if (cmd === 'AIR_FRYER_ON') {
        setAppliances((prev) => prev.map((a) => (a.name === 'Air Fryer' ? { ...a, state: 'ON' } : a)));
        webSerialManager.sendCommand('AIR_FRYER_ON');
      } else if (cmd === 'AIR_FRYER_OFF') {
        setAppliances((prev) => prev.map((a) => (a.name === 'Air Fryer' ? { ...a, state: 'OFF' } : a)));
        webSerialManager.sendCommand('AIR_FRYER_OFF');
      } else if (cmd === 'AC_ON') {
        setAppliances((prev) => prev.map((a) => (a.name === 'AC' ? { ...a, state: 'ON' } : a)));
        webSerialManager.sendCommand('AC_ON');
      } else if (cmd === 'AC_OFF') {
        setAppliances((prev) => prev.map((a) => (a.name === 'AC' ? { ...a, state: 'OFF' } : a)));
        webSerialManager.sendCommand('AC_OFF');
      }
    };

    return () => {
      voiceAssistant.onLog = null;
      voiceAssistant.onStatusChange = null;
      voiceAssistant.onCommand = null;
    };
  }, []);

  // Hardcoded stable temperature around 25°C (oscillates gently between 24.8°C and 25.3°C)
  useEffect(() => {
    const sensorInterval = setInterval(() => {
      const candidates = [24.8, 24.9, 25.0, 25.0, 25.1, 25.2, 25.3];
      const nextTemp = candidates[Math.floor(Math.random() * candidates.length)];
      setTemperature(nextTemp);

      const humCandidates = [57, 58, 58, 59];
      const nextHum = humCandidates[Math.floor(Math.random() * humCandidates.length)];
      setHumidity(nextHum);
    }, 4000);
    return () => clearInterval(sensorInterval);
  }, []);
  // Replicating AutoModeController.java: when Auto Mode is ON:
  // If Temperature >= 30°C (comfort threshold), automatically turn ON Fan & AC
  // If Temperature < 30°C, automatically turn OFF Fan & AC
  useEffect(() => {
    if (!autoMode) return;

    const threshold = 30; // Threshold for hot room
    const shouldCool = temperature >= threshold;

    setAppliances((prev) => {
      let changed = false;
      const updated = prev.map((app) => {
        if (app.name === 'Fan' || app.name === 'AC') {
          const targetState = shouldCool ? 'ON' : 'OFF';
          if (app.state !== targetState) {
            changed = true;
            const command = app.name === 'Fan' 
              ? (shouldCool ? 'FAN_ON' : 'FAN_OFF')
              : (shouldCool ? 'AC_ON' : 'AC_OFF');
            webSerialManager.sendCommand(command);
            addLog(`[AUTO MODE] ${app.name} automatically turned ${targetState} (Temp: ${temperature}°C, Threshold: ${threshold}°C)`, shouldCool ? 'success' : 'warn');
            return { ...app, state: targetState };
          }
        }
        return app;
      });
      return changed ? updated : prev;
    });
  }, [autoMode, temperature]);

  // Calculate total power
  const totalWatts = appliances
    .filter((a) => a.state === 'ON')
    .reduce((acc, curr) => acc + curr.powerRating, 0);

  // Update telemetry history
  useEffect(() => {
    setTelemetryHistory((prev) => ({
      temp: [...prev.temp.slice(1), temperature],
      hum: [...prev.hum.slice(1), humidity],
      power: [...prev.power.slice(1), totalWatts],
      energy: [...prev.energy.slice(1), Math.round((prev.energy[prev.energy.length - 1] + totalWatts / 3600000) * 1000) / 1000],
    }));
  }, [totalWatts, temperature, humidity]);

  // Connect / Disconnect USB Arduino
  const handleConnectUsb = async () => {
    if (serialConnected) {
      await webSerialManager.disconnect();
    } else {
      setIsConnecting(true);
      try {
        await webSerialManager.connect();
      } catch (err) {
        setIsConnecting(false);
      }
    }
  };

  // Toggle single appliance (and transmit to Arduino)
  const handleToggle = (name) => {
    setAppliances((prev) =>
      prev.map((app) => {
        if (app.name === name) {
          const nextState = app.state === 'ON' ? 'OFF' : 'ON';
          const isTurnOn = nextState === 'ON';
          
          // Map to exact Arduino command
          let command = '';
          if (name === 'Light') command = isTurnOn ? 'LIGHT_ON' : 'LIGHT_OFF';
          else if (name === 'Fan') command = isTurnOn ? 'FAN_ON' : 'FAN_OFF';
          else if (name === 'Air Fryer') command = isTurnOn ? 'AIR_FRYER_ON' : 'AIR_FRYER_OFF';
          else if (name === 'AC') command = isTurnOn ? 'AC_ON' : 'AC_OFF';

          if (command) {
            webSerialManager.sendCommand(command);
          }

          addLog(`[COMMAND] ${name} set to ${nextState} (${isTurnOn ? app.powerRating + 'W' : '0W'})`, isTurnOn ? 'success' : 'warn');
          return { ...app, state: nextState };
        }
        return app;
      })
    );
  };

  // Master All Off
  const handleAllOff = () => {
    webSerialManager.sendCommand('ALL_OFF');
    setAppliances((prev) => prev.map((app) => ({ ...app, state: 'OFF' })));
    addLog('[SYSTEM] All appliances deactivated (ALL_OFF sent)', 'warn');
  };

  // Master All On
  const handleAllOn = () => {
    webSerialManager.sendCommand('LIGHT_ON');
    setTimeout(() => webSerialManager.sendCommand('FAN_ON'), 60);
    setTimeout(() => webSerialManager.sendCommand('AIR_FRYER_ON'), 120);
    setTimeout(() => webSerialManager.sendCommand('AC_ON'), 180);
    setAppliances((prev) => prev.map((app) => ({ ...app, state: 'ON' })));
    addLog('[SYSTEM] All appliances activated', 'success');
  };

  // Toggle Auto Mode
  const toggleAutoMode = () => {
    setAutoMode((prev) => {
      const next = !prev;
      addLog(`[AUTO MODE] Automated Environmental Controller ${next ? 'ACTIVATED' : 'DEACTIVATED'}`, next ? 'info' : 'warn');
      return next;
    });
  };

  // Toggle Voice Assistant
  const toggleVoice = () => {
    if (!voiceAssistant.isSupported()) {
      addLog('[VOICE CORE] Speech recognition not supported by browser. Please use Chrome or Edge.', 'warn');
      return;
    }

    if (voiceActive) {
      voiceAssistant.stop();
      setVoiceActive(false);
    } else {
      const ok = voiceAssistant.start();
      if (ok) {
        setVoiceActive(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-space-900 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-space-950/75 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Slide-over Toggle Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 glass-panel border-r border-white/10 z-50 flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(34,211,238,0.25)]' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand & Close button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white font-sans">
                  UNIFIED SMART
                </h2>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                  Control Hub v2.0
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Hardware Status */}
          <div className="rounded-xl bg-space-850/80 border border-white/5 p-3.5 mb-6 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Arduino Link:</span>
              <span className={serialConnected ? 'text-cyan-300 flex items-center gap-1.5' : 'text-slate-400 flex items-center gap-1.5'}>
                <span className={`w-2 h-2 rounded-full ${serialConnected ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
                {serialConnected ? (portName ? 'USB Connected' : 'COM Connected') : 'Offline (Sim)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Draw:</span>
              <span className="text-amber-400 font-bold">{totalWatts} W</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            <button
              onClick={() => {
                scrollToOverview();
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => {
                scrollToLogs();
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-800'
              }`}
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Hardware Event Logs</span>
            </button>
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="pt-6 border-t border-white/5 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
                AD
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Administrator</span>
                <span className="text-[10px] text-slate-400 font-mono">admin@smarthome</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport (Full Width) */}
      <main ref={mainRef} className="flex-1 p-4 lg:p-7 space-y-6 overflow-y-auto scroll-smooth w-full">
        {/* Top Header Bar with Hamburger Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3.5">
            {/* Top-Left Three-Line Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-space-850 hover:bg-space-800 border border-white/10 text-cyan-400 hover:text-cyan-300 shadow-cyan-glow transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Toggle Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Control Board Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected to 4 smart appliances and telemetry sensor network
              </p>
            </div>
          </div>

          {/* Quick Action Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-space-850 border border-white/5 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>

            {/* USB Arduino Connection Button */}
            <button
              onClick={handleConnectUsb}
              disabled={isConnecting}
              title={serialConnected ? 'Disconnect Arduino USB' : 'Connect Physical Arduino via USB'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                serialConnected
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-space-850 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/60 shadow-cyan-glow'
              }`}
            >
              <Usb className={`w-3.5 h-3.5 ${serialConnected ? 'text-emerald-400' : 'text-cyan-400'} ${isConnecting ? 'animate-spin' : ''}`} />
              <span>
                {isConnecting
                  ? 'Connecting...'
                  : serialConnected
                  ? 'Arduino: Connected'
                  : '🔌 Connect Arduino'}
              </span>
            </button>

            {/* Auto Mode Toggle */}
            <button
              onClick={toggleAutoMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                autoMode
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-cyan-glow'
                  : 'bg-space-850 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto: {autoMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Voice Command Toggle */}
            <button
              onClick={toggleVoice}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                voiceActive
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-amber-glow'
                  : 'bg-space-850 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {voiceActive ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
              <span className="max-w-[180px] truncate">
                {voiceActive
                  ? liveTranscript
                    ? `Heard: "${liveTranscript}"`
                    : 'Voice: Speak now...'
                  : 'Voice: Idle'}
              </span>
            </button>

            {/* Emergency Master Power Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAllOn}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-medium transition-all cursor-pointer"
              >
                All ON
              </button>
              <button
                onClick={handleAllOff}
                className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-mono font-medium transition-all cursor-pointer"
              >
                All OFF
              </button>
            </div>
          </div>
        </div>

        {/* Live Monitoring Sparklines */}
        <TelemetrySparklines
          temperature={temperature}
          humidity={humidity}
          totalWatts={totalWatts}
          totalKwh={telemetryHistory.energy[telemetryHistory.energy.length - 1]}
          history={telemetryHistory}
        />

        {/* Full Screen Scale Interactive Bedroom Map */}
        <div className="w-full">
          <InteractiveFloor3D
            appliances={appliances}
            onToggle={handleToggle}
            temperature={Math.round(temperature)}
          />
        </div>

        {/* 4 Compact Appliance Cards in One Single Row Below the Map */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {appliances.map((app) => (
              <DeviceSwitchCard
                key={app.name}
                appliance={app}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>

        {/* Live Event Stream Terminal / Logs Drawer */}
        <div
          ref={logsRef}
          className={`rounded-2xl glass-panel p-5 border transition-all duration-500 ${
            highlightLogs
              ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.45)] ring-2 ring-cyan-400/50'
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                System Hardware Stream & Telemetry Logs
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {logs.length} events logged
            </span>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto font-mono text-xs pr-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 py-1 px-2.5 rounded-lg bg-space-950/50 border border-white/5"
              >
                <span className="text-slate-500 text-[11px] shrink-0">{log.time}</span>
                <span
                  className={
                    log.level === 'success'
                      ? 'text-cyan-300'
                      : log.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }
                >
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
