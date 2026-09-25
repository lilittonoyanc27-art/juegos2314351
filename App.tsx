import React, { useState } from 'react';
import { MillonarioGame } from './MillonarioGame';
import { PasapalabraVerbosGame } from './PasapalabraVerbosGame';
import { PasapalabraNumerosGame } from './PasapalabraNumerosGame';
import { ProblemasMatematicosGame } from './ProblemasMatematicosGame';
import { sounds } from './soundEffects';
import { 
  Trophy, 
  Sparkles, 
  Calculator, 
  Volume2, 
  VolumeX, 
  GraduationCap, 
  Languages, 
  Info,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'millonario' | 'verbos' | 'numeros' | 'matematicas'>('millonario');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) {
      sounds.playCorrect();
    }
  };

  const handleTabChange = (tab: 'millonario' | 'verbos' | 'numeros' | 'matematicas') => {
    sounds.playSelect();
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#070b19] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.3),rgba(255,255,255,0))] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-indigo-950/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Flags */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xl sm:text-2xl" title="España">🇪🇸</span>
              <span className="text-xl sm:text-2xl" title="Armenia">🇦🇲</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Juegos en Español</span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Իսպաներեն Խաղեր
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Սեղմեք ցանկացած հարցի վրա՝ հայերեն թարգմանությունը տեսնելու համար
              </p>
            </div>
          </div>

          {/* Right Tools (Sound, Info) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              title="Ինֆորմացիա և ուղեցույց"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-indigo-900/60 border-indigo-600 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Ձայնը միացված է' : 'Ձայնն անջատված է'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Game Navigation Tabs */}
        <div className="max-w-6xl mx-auto mt-3 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Tab 1: Millonario */}
          <button
            onClick={() => handleTabChange('millonario')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === 'millonario'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>1. ¿Quién quiere ser millonario?</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">15</span>
          </button>

          {/* Tab 2: Pasapalabra Verbos */}
          <button
            onClick={() => handleTabChange('verbos')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === 'verbos'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Pasapalabra • Verbos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">27</span>
          </button>

          {/* Tab 3: Pasapalabra Números */}
          <button
            onClick={() => handleTabChange('numeros')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === 'numeros'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-pink-300 shadow-lg shadow-pink-500/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <span className="font-mono font-black text-xs">123</span>
            <span>3. Pasapalabra • Números</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">27</span>
          </button>

          {/* Tab 4: Problemas Matemáticos */}
          <button
            onClick={() => handleTabChange('matematicas')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === 'matematicas'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>4. Problemas Matemáticos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">15</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-start py-4 sm:py-6">
        {activeTab === 'millonario' && <MillonarioGame />}
        {activeTab === 'verbos' && <PasapalabraVerbosGame />}
        {activeTab === 'numeros' && <PasapalabraNumerosGame />}
        {activeTab === 'matematicas' && <ProblemasMatematicosGame />}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-3 px-4 text-center text-xs text-slate-400">
        <p>
          🇪🇸 Práctica interactiva de español con traducción al armenio 🇦🇲 • Սեղմեք հարցի վրա՝ թարգմանությունը տեսնելու համար:
        </p>
      </footer>

      {/* Info / Guide Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-lg w-full rounded-3xl bg-slate-900 border-2 border-indigo-500/60 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
                <BookOpen className="w-5 h-5" />
                <span>Հավելվածի հնարավորությունները / Instrucciones</span>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800">
                <h4 className="font-bold text-amber-300 mb-1">💰 1. ¿Quién quiere ser millonario? (15 հարց)</h4>
                <p>
                  Իսկական խաղի նման մրցանակային սանդուղքով, 3 հուշումներով (50:50, դահլիճ, զանգ): Եթե պատասխանը սխալ լինի, խաղը չի ընդհատվում, այլ ցույց է տալիս ճիշտ տարբերակը, քերականական բացատրությունը և թույլ է տալիս շարունակել մինչև վերջ:
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800">
                <h4 className="font-bold text-cyan-300 mb-1">🔤 2. Pasapalabra • Verbos (27 հարց)</h4>
                <p>
                  Հայտնի իսպանական խաղի շրջանաձև «El Rosco»-ն՝ saber, conocer, oír, escuchar, gustar, llevar, traer բայերով: Կարող եք օգտագործել «Pasapalabra» կոճակը՝ հարցը բաց թողնելու և հետո վերադառնալու համար:
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800">
                <h4 className="font-bold text-pink-300 mb-1">🔢 3. Pasapalabra • Números (27 թվեր)</h4>
                <p>
                  347-ից մինչև 12 200 թվերի գրելաձևն ու արտասանությունը: Հասանելի է տարբերակներով, բանավոր արտասանությամբ և գրավոր ստուգմամբ:
                </p>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-800">
                <h4 className="font-bold text-teal-300 mb-1">➗ 4. Problemas Matemáticos (15 խնդիր)</h4>
                <p>
                  Մաթեմատիկական խնդիրներ իսպաներենով և հայերենով՝ բանավոր պրակտիկայի, հաշվարկի և քայլ առ քայլ լուծման բացատրությամբ:
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-xs uppercase cursor-pointer"
            >
              Հասկանալի է / Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
