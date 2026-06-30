import React from "react";
import { Zap, RefreshCw, Flame, BrainCircuit } from "lucide-react";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const { signIn, error } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-mono selection:bg-[#FF2D2D] selection:text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.8)_0%,rgba(0,0,0,1)_100%)]"></div>
      <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF2D2D]/30 z-0 animate-pulse"></div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 lg:p-24 z-10 max-w-7xl mx-auto w-full gap-12 lg:gap-24">
        
        {/* Left Side: Brand/Hero */}
        <div className="flex-1 flex flex-col items-start space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <div className="space-y-4 w-full">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
              GRAVITAS
            </h1>
            <div className="h-0.5 w-16 bg-[#FF2D2D]"></div>
            <p className="text-2xl md:text-3xl font-medium text-zinc-300">
              The weight of action.
            </p>
            <p className="text-lg md:text-xl text-zinc-500 max-w-xl leading-relaxed">
              Autonomous AI agent that plans, replans, and executes your deadlines — without waiting for commands.
            </p>
          </div>

          <ul className="space-y-4 pt-4">
            <li className="flex items-start gap-4 text-zinc-300">
              <Zap className="w-6 h-6 text-[#FF8C00] shrink-0 mt-0.5" />
              <span className="text-base md:text-lg">Autonomous task planning — no manual scheduling</span>
            </li>
            <li className="flex items-start gap-4 text-zinc-300">
              <RefreshCw className="w-6 h-6 text-[#00C853] shrink-0 mt-0.5" />
              <span className="text-base md:text-lg">Self-replanning when life happens</span>
            </li>
            <li className="flex items-start gap-4 text-zinc-300">
              <Flame className="w-6 h-6 text-[#FF2D2D] shrink-0 mt-0.5" />
              <span className="text-base md:text-lg">Rescue Mode for last-minute deadlines</span>
            </li>
            <li className="flex items-start gap-4 text-zinc-300">
              <BrainCircuit className="w-6 h-6 text-[#FFD700] shrink-0 mt-0.5" />
              <span className="text-base md:text-lg">Powered by Gemini 2.5 Flash</span>
            </li>
          </ul>
        </div>

        {/* Right Side: Sign-In Panel */}
        <div className="w-full lg:w-[420px] shrink-0 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="bg-zinc-900 border-2 border-zinc-800 p-8 flex flex-col relative group">
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-zinc-500"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-zinc-500"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-zinc-500"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-zinc-500"></div>

            <div className="text-center mb-8">
              <div className="text-[#FF2D2D] text-xs font-bold tracking-[0.2em] mb-2 uppercase">
                Commander Access
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 text-red-200 px-4 py-3 text-sm mb-6 flex items-start gap-3">
                <Flame className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={signIn}
              className="w-full bg-white text-black font-bold py-4 px-6 uppercase tracking-wider hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,45,45,0.4)] hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-[#FF2D2D]/50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <p className="text-zinc-500 text-xs text-center mt-6 uppercase tracking-wider">
              Your data stays private.<br/>No credit card required.
            </p>
          </div>
        </div>

      </main>

      {/* Social Proof Footer */}
      <footer className="w-full py-6 text-center z-10 border-t border-zinc-900 bg-black/50 backdrop-blur-sm">
        <p className="text-zinc-500 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-[#FF2D2D] rounded-full animate-pulse"></span>
          Built for the Last-Minute Life Saver Challenge — Powered by Google Gemini & Cloud Run
        </p>
      </footer>
    </div>
  );
}
