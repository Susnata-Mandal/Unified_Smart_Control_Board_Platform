import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, Eye, EyeOff, Cpu, Wifi, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import NetworkHero3D from '../components/NetworkHero3D';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeCount, setShakeCount] = useState(0);

  const reducedMotion = useReducedMotion();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      // Authenticate against default system credentials (admin / admin123)
      if (username.trim() === 'admin' && password === 'admin123') {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess({ username: 'admin', role: 'System Administrator' });
        }
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid username or password. Default is admin / admin123');
        setShakeCount((prev) => prev + 1);
      }
    }, 450);
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-space-900 select-none py-8">
      {/* 3D Animated Hero Scene Background */}
      <NetworkHero3D force2D={reducedMotion} />

      {/* Decorative ambient radial light blooms */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-cyan-glow/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <motion.div
        key={shakeCount}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={
          errorMessage
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
                x: [0, -10, 10, -7, 7, -3, 3, 0],
                transition: { duration: 0.45 },
              }
            : {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.5, ease: 'easeOut' },
              }
        }
        className="relative z-10 w-full max-w-md rounded-2xl glass-panel p-6 sm:p-8 shadow-glass border border-white/10 my-auto"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 mb-2.5 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
            <Cpu className="w-6 h-6 text-cyan-400 animate-pulse-slow" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
            UNIFIED SMART CONTROL
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[11px] tracking-wider uppercase font-mono text-cyan-300/80">
              Board Gateway v2.0
            </span>
          </div>
        </div>

        {/* Error Notification Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 18 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="rounded-xl bg-danger-dim border border-danger-red/40 p-3.5 flex items-start gap-3 text-red-300 text-xs shadow-red-glow"
            >
              <AlertTriangle className="w-4 h-4 text-danger-red shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-red-200">Access Denied</span>
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 tracking-wide">
              Security Identifier
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full glass-input text-sm text-slate-100 rounded-xl pl-10 pr-4 py-3 placeholder-slate-500 font-mono tracking-wide focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300 tracking-wide">
                Security Key
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2"
              >
                Auto-fill default
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full glass-input text-sm text-slate-100 rounded-xl pl-10 pr-11 py-3 placeholder-slate-500 font-mono tracking-wide focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-cyan-400 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Hardware Connection Status Indicator */}
          <div className="flex items-center justify-between py-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hardware Link:</span>
            </div>
            <span className="font-mono text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
              COM9 / SIMULATOR
            </span>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.015, boxShadow: '0 0 25px rgba(34, 211, 238, 0.4)' }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={isLoading}
            className="w-full group relative flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-medium text-sm text-space-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-cyan-glow disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-space-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="tracking-wide uppercase font-semibold">Initialize Control Session</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Meta */}
        <div className="mt-7 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400/70" />
            <span>Encrypted Session</span>
          </div>
          <span>Build 2026.10</span>
        </div>
      </motion.div>
    </div>
  );
}
