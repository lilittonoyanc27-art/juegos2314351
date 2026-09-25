import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { VERBOS_QUESTIONS, MultipleChoiceQuestion } from './quizData';
import { sounds } from './soundEffects';
import { speakText } from './speechHelper';
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Languages, 
  ArrowRight,
  Sparkles,
  Trophy,
  Clock,
  Play,
  Pause,
  HelpCircle
} from 'lucide-react';

interface LetterStatus {
  [letter: string]: 'pending' | 'correct' | 'wrong' | 'passed';
}

export const PasapalabraVerbosGame: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [statuses, setStatuses] = useState<LetterStatus>(() => {
    const initial: LetterStatus = {};
    VERBOS_QUESTIONS.forEach((q) => {
      if (q.letter) initial[q.letter] = 'pending';
    });
    return initial;
  });

  const [selectedKey, setSelectedKey] = useState<'a' | 'b' | 'c' | 'd' | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [isArmenianVisible, setIsArmenianVisible] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Timer: 20 minutes (1200 seconds) for rosco
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);

  const currentQ: MultipleChoiceQuestion = VERBOS_QUESTIONS[currentIdx];

  // Rosco timer effect
  useEffect(() => {
    if (!isTimerRunning || gameFinished || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          setGameFinished(true);
          sounds.playWrong();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, gameFinished, timeLeft]);

  // Count scores
  const aciertos = Object.values(statuses).filter((s) => s === 'correct').length;
  const fallos = Object.values(statuses).filter((s) => s === 'wrong').length;
  const pendingCount = Object.values(statuses).filter((s) => s === 'pending' || s === 'passed').length;

  const findNextUnanswered = (startIdx: number): number => {
    const total = VERBOS_QUESTIONS.length;
    for (let step = 1; step <= total; step++) {
      const idx = (startIdx + step) % total;
      const letter = VERBOS_QUESTIONS[idx].letter || '';
      if (statuses[letter] === 'pending' || statuses[letter] === 'passed') {
        return idx;
      }
    }
    return startIdx;
  };

  const handleSelectOption = (key: 'a' | 'b' | 'c' | 'd') => {
    if (isAnswerConfirmed || !currentQ.letter) return;
    setSelectedKey(key);
    setIsAnswerConfirmed(true);
    setShowExplanation(true);

    const isCorrect = key === currentQ.correct;
    const letter = currentQ.letter;

    setStatuses((prev) => ({
      ...prev,
      [letter]: isCorrect ? 'correct' : 'wrong',
    }));

    if (isCorrect) {
      sounds.playCorrect();
      if (aciertos + 1 === VERBOS_QUESTIONS.length) {
        sounds.playFanfare();
        confetti({ particleCount: 200, spread: 100 });
        setGameFinished(true);
      }
    } else {
      sounds.playWrong();
    }
  };

  const handleNextOrContinue = () => {
    sounds.playSelect();
    setIsAnswerConfirmed(false);
    setSelectedKey(null);
    setIsArmenianVisible(false);
    setShowExplanation(false);

    // If all completed
    const remaining = VERBOS_QUESTIONS.filter(
      (q, idx) => idx !== currentIdx && (statuses[q.letter || ''] === 'pending' || statuses[q.letter || ''] === 'passed')
    );

    if (remaining.length === 0) {
      setGameFinished(true);
      sounds.playFanfare();
      confetti({ particleCount: 150, spread: 80 });
      return;
    }

    const next = findNextUnanswered(currentIdx);
    setCurrentIdx(next);
  };

  const handlePasapalabra = () => {
    if (!currentQ.letter || isAnswerConfirmed) return;
    sounds.playPasapalabra();
    const letter = currentQ.letter;

    // Mark as passed (orange / yellow)
    setStatuses((prev) => ({
      ...prev,
      [letter]: 'passed',
    }));

    setIsAnswerConfirmed(false);
    setSelectedKey(null);
    setIsArmenianVisible(false);
    setShowExplanation(false);

    const next = findNextUnanswered(currentIdx);
    setCurrentIdx(next);
  };

  const handleRestart = () => {
    sounds.playSelect();
    setCurrentIdx(0);
    const initial: LetterStatus = {};
    VERBOS_QUESTIONS.forEach((q) => {
      if (q.letter) initial[q.letter] = 'pending';
    });
    setStatuses(initial);
    setSelectedKey(null);
    setIsAnswerConfirmed(false);
    setIsArmenianVisible(false);
    setShowExplanation(false);
    setTimeLeft(1200);
    setIsTimerRunning(true);
    setGameFinished(false);
  };

  // Helper to jump to a specific letter by clicking on the rosco
  const handleLetterClick = (idx: number) => {
    if (isAnswerConfirmed) return;
    sounds.playSelect();
    setCurrentIdx(idx);
    setIsArmenianVisible(false);
    setShowExplanation(false);
    setSelectedKey(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 text-white select-none">
      {/* Pasapalabra Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-blue-900/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-cyan-300">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-blue-200 via-cyan-100 to-blue-400 bg-clip-text text-transparent uppercase">
              Pasapalabra • El Rosco (Բառաշարժ)
            </h1>
            <p className="text-xs sm:text-sm text-cyan-300">
              saber / conocer / oír / escuchar / gustar / llevar / traer (27 տառ)
            </p>
          </div>
        </div>

        {/* Score & Timer Badges */}
        <div className="flex items-center gap-3">
          {/* Aciertos (Green) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-black text-emerald-300 text-sm">{aciertos}</span>
            <span className="text-[10px] text-emerald-400/80 uppercase">Ճիշտ</span>
          </div>

          {/* Fallos (Red) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 shadow-md">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span className="font-mono font-black text-rose-300 text-sm">{fallos}</span>
            <span className="text-[10px] text-rose-400/80 uppercase">Սխալ</span>
          </div>

          {/* Timer Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/90 border border-blue-400/50 shadow-md">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-black text-white text-base">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              title={isTimerRunning ? 'Դադարեցնել' : 'Շարունակել'}
              className="text-cyan-300 hover:text-white"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Arena: Circular Rosco on Left/Center + Question Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* THE CIRCULAR ROSCO WHEEL (Matches TV show screenshot!) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full flex items-center justify-center p-2 bg-gradient-to-b from-blue-950/40 to-slate-950/60 border border-blue-800/40 shadow-2xl">
            {/* Center Hub */}
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-blue-900 via-slate-900 to-indigo-950 border-2 border-cyan-400/50 flex flex-col items-center justify-center text-center p-3 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_70%)]" />
              
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Letra activa
              </span>
              <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-md my-1">
                {currentQ.letter}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-300 max-w-[130px] sm:max-w-[170px] truncate">
                {pendingCount} մնացել է
              </span>

              {/* Instant Pasapalabra Button in center */}
              <button
                disabled={isAnswerConfirmed}
                onClick={handlePasapalabra}
                className="mt-2 px-3 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30 cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
              >
                Pasapalabra
              </button>
            </div>

            {/* 27 Rosco Letter Bubbles placed on circle radius */}
            {VERBOS_QUESTIONS.map((q, idx) => {
              const total = VERBOS_QUESTIONS.length;
              // Angle starting from top (-90 degrees) and rotating clockwise
              const angleDeg = (idx / total) * 360 - 90;
              const angleRad = (angleDeg * Math.PI) / 180;
              
              // responsive radius
              const radiusPct = 43; // percentage of parent container
              const x = 50 + radiusPct * Math.cos(angleRad);
              const y = 50 + radiusPct * Math.sin(angleRad);

              const letter = q.letter || '';
              const status = statuses[letter] || 'pending';
              const isCurrent = idx === currentIdx;

              let bubbleClass = 'bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900 border-blue-300/60 text-white shadow-blue-900/80';
              if (status === 'correct') {
                bubbleClass = 'bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-800 border-emerald-300 text-white shadow-emerald-950';
              } else if (status === 'wrong') {
                bubbleClass = 'bg-gradient-to-b from-rose-500 via-rose-700 to-rose-900 border-rose-300 text-white shadow-rose-950';
              } else if (status === 'passed') {
                bubbleClass = 'bg-gradient-to-b from-amber-400 via-yellow-600 to-amber-700 border-yellow-200 text-slate-950 font-black shadow-amber-950';
              }

              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(idx)}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black border-2 transition-all duration-300 shadow-lg cursor-pointer ${bubbleClass} ${
                    isCurrent
                      ? 'scale-130 ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-950 z-20 animate-pulse'
                      : 'hover:scale-115'
                  }`}
                  title={`Տառ ${letter} (Հարց ${idx + 1})`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Quick Help / Instruction */}
          <div className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>🔵 Չպատասխանած</span>
            <span>🟢 Ճիշտ</span>
            <span>🔴 Սխալ</span>
            <span>🟡 Բաց թողնված</span>
          </div>
        </div>

        {/* QUESTION & MULTIPLE CHOICE CONTROLS (Right 6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Card for Question (Click to Reveal Armenian Translation!) */}
          <div
            onClick={() => setIsArmenianVisible(!isArmenianVisible)}
            className="group relative cursor-pointer p-6 rounded-3xl bg-gradient-to-b from-blue-900/80 via-slate-900 to-indigo-950 border-2 border-cyan-400/50 hover:border-cyan-300 shadow-2xl transition-all hover:scale-[1.01]"
          >
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-semibold">
                  <Languages className="w-3.5 h-3.5" />
                  {isArmenianVisible
                    ? '🇦🇲 Հայերեն թարգմանություն (Սեղմեք փակելու)'
                    : '🇪🇸 Իսպաներեն (Սեղմեք հայերեն թարգմանությունը տեսնելու համար)'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentQ.spanish, 'es');
                  }}
                  title="Լսել իսպաներեն արտասանությունը"
                  className="p-2 rounded-xl bg-blue-800/60 hover:bg-cyan-500/20 text-cyan-200 hover:text-cyan-300 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Spanish Question Text */}
              <div className="text-xl sm:text-2xl font-bold text-white leading-relaxed text-center py-2">
                <span className="inline-block px-2.5 py-0.5 mr-2 rounded-lg bg-cyan-500/20 text-cyan-300 font-black border border-cyan-400/40">
                  {currentQ.letter}
                </span>
                {currentQ.spanish}
              </div>

              {/* Armenian Translation Reveal */}
              <div
                className={`transition-all duration-300 overflow-hidden text-center rounded-2xl ${
                  isArmenianVisible
                    ? 'max-h-40 p-3 bg-cyan-500/15 border border-cyan-400/40 text-cyan-100 text-base sm:text-lg font-medium'
                    : 'max-h-0 opacity-0'
                }`}
              >
                🇦🇲 {currentQ.armenian}
              </div>

              <div className="text-center text-[11px] text-slate-400 group-hover:text-cyan-300/80 transition-colors">
                👆 Սեղմեք այստեղ՝ թարգմանությունը {isArmenianVisible ? 'թաքցնելու' : 'տեսնելու'} համար
              </div>
            </div>
          </div>

          {/* Multiple Choice Options (4 options) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedKey === opt.key;
              const isCorrectAnswer = opt.key === currentQ.correct;

              let btnStyle = 'border-blue-800/60 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-blue-100 hover:border-cyan-400 hover:text-white';
              let badgeStyle = 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';

              if (isAnswerConfirmed) {
                if (isCorrectAnswer) {
                  btnStyle = 'border-emerald-400 bg-emerald-950/90 text-emerald-100 ring-2 ring-emerald-400/50 shadow-lg';
                  badgeStyle = 'text-emerald-300 bg-emerald-400/20 border-emerald-400';
                } else if (isSelected && !isCorrectAnswer) {
                  btnStyle = 'border-rose-500 bg-rose-950/90 text-rose-100 ring-2 ring-rose-500/50 shadow-lg';
                  badgeStyle = 'text-rose-300 bg-rose-500/20 border-rose-500';
                } else {
                  btnStyle = 'border-slate-800/50 bg-slate-950/40 text-slate-500 opacity-60';
                  badgeStyle = 'text-slate-600 bg-slate-800/30 border-slate-700';
                }
              }

              return (
                <button
                  key={opt.key}
                  disabled={isAnswerConfirmed}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer shadow-md ${btnStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center border shrink-0 uppercase ${badgeStyle}`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-base font-bold flex-1">{opt.text}</span>
                  {isAnswerConfirmed && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerConfirmed && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Row: Pasapalabra / Next Button */}
          <div className="flex items-center gap-3 pt-2">
            {!isAnswerConfirmed ? (
              <button
                onClick={handlePasapalabra}
                className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 active:scale-98"
              >
                <span>Pasapalabra (Բաց թողնել տառը)</span>
              </button>
            ) : (
              <button
                onClick={handleNextOrContinue}
                className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 active:scale-98"
              >
                <span>Շարունակել (Siguiente letra)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Explanation Box on Answer */}
          {showExplanation && (
            <div
              className={`p-4 rounded-2xl border-2 flex flex-col gap-2 animate-in fade-in ${
                selectedKey === currentQ.correct
                  ? 'bg-emerald-950/70 border-emerald-500/70'
                  : 'bg-rose-950/70 border-rose-500/70'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">
                {selectedKey === currentQ.correct ? (
                  <span className="text-emerald-300">¡Acierto! Ճիշտ պատասխան:</span>
                ) : (
                  <span className="text-rose-300">
                    Սխալ: Ճիշտ տարբերակն է՝{' '}
                    <strong className="underline text-white">
                      {currentQ.correct.toUpperCase()}) {currentQ.options.find((o) => o.key === currentQ.correct)?.text}
                    </strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200">🇪🇸 {currentQ.explanationEs}</p>
              <p className="text-xs text-amber-200">🇦🇲 {currentQ.explanationHy}</p>
            </div>
          )}

          {/* End of Game Modal/Card */}
          {gameFinished && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border-2 border-cyan-400 text-center flex flex-col items-center gap-3">
              <Trophy className="w-12 h-12 text-cyan-300" />
              <h3 className="text-xl font-black text-white">¡Fin del Rosco! Խաղն ավարտվեց</h3>
              <p className="text-sm text-cyan-200">
                Ճիշտ: <strong className="text-emerald-400">{aciertos}</strong> | Սխալ: <strong className="text-rose-400">{fallos}</strong> (ընդհանուր 27 հարց)
              </p>
              <button
                onClick={handleRestart}
                className="mt-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Կրկին խաղալ (Reiniciar Rosco)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
