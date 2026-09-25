import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { NUMEROS_QUESTIONS, NumberQuestion } from './quizData';
import { sounds } from './soundEffects';
import { speakText } from './speechHelper';
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Languages, 
  ArrowRight,
  Eye,
  Keyboard,
  ListFilter,
  Trophy,
  Sparkles,
  Clock,
  Play,
  Pause
} from 'lucide-react';

interface LetterStatus {
  [letter: string]: 'pending' | 'correct' | 'wrong' | 'passed';
}

export const PasapalabraNumerosGame: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [statuses, setStatuses] = useState<LetterStatus>(() => {
    const initial: LetterStatus = {};
    NUMEROS_QUESTIONS.forEach((q) => {
      initial[q.letter] = 'pending';
    });
    return initial;
  });

  const [mode, setMode] = useState<'options' | 'input' | 'oral'>('options');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userTyped, setUserTyped] = useState('');
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [isArmenianVisible, setIsArmenianVisible] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Timer: 20 minutes (1200 seconds)
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Timer effect
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

  const currentQ: NumberQuestion = NUMEROS_QUESTIONS[currentIdx];

  // Prepare shuffled options for current question
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(() => {
    return [currentQ.wordInSpanish, ...currentQ.wrongOptions].sort(() => 0.5 - Math.random());
  });

  const updateQuestionState = (newIdx: number) => {
    setCurrentIdx(newIdx);
    const nextQ = NUMEROS_QUESTIONS[newIdx];
    setShuffledOptions([nextQ.wordInSpanish, ...nextQ.wrongOptions].sort(() => 0.5 - Math.random()));
    setSelectedOption(null);
    setUserTyped('');
    setIsAnswerConfirmed(false);
    setIsArmenianVisible(false);
    setIsRevealed(false);
  };

  const aciertos = Object.values(statuses).filter((s) => s === 'correct').length;
  const fallos = Object.values(statuses).filter((s) => s === 'wrong').length;

  const handleSelectOption = (opt: string) => {
    if (isAnswerConfirmed) return;
    setSelectedOption(opt);
    setIsAnswerConfirmed(true);
    setIsRevealed(true);

    const isCorrect = opt.trim().toLowerCase() === currentQ.wordInSpanish.trim().toLowerCase();
    setStatuses((prev) => ({
      ...prev,
      [currentQ.letter]: isCorrect ? 'correct' : 'wrong',
    }));

    if (isCorrect) {
      sounds.playCorrect();
      speakText(currentQ.wordInSpanish, 'es');
      if (aciertos + 1 === NUMEROS_QUESTIONS.length) {
        sounds.playFanfare();
        confetti({ particleCount: 200, spread: 90 });
        setGameFinished(true);
      }
    } else {
      sounds.playWrong();
    }
  };

  const handleCheckInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswerConfirmed || !userTyped.trim()) return;

    setIsAnswerConfirmed(true);
    setIsRevealed(true);

    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    const isCorrect = normalize(userTyped) === normalize(currentQ.wordInSpanish);

    setStatuses((prev) => ({
      ...prev,
      [currentQ.letter]: isCorrect ? 'correct' : 'wrong',
    }));

    if (isCorrect) {
      sounds.playCorrect();
      speakText(currentQ.wordInSpanish, 'es');
      if (aciertos + 1 === NUMEROS_QUESTIONS.length) {
        sounds.playFanfare();
        confetti({ particleCount: 200, spread: 90 });
        setGameFinished(true);
      }
    } else {
      sounds.playWrong();
    }
  };

  const handleSelfGradeOral = (isCorrect: boolean) => {
    setIsAnswerConfirmed(true);
    setIsRevealed(true);
    setStatuses((prev) => ({
      ...prev,
      [currentQ.letter]: isCorrect ? 'correct' : 'wrong',
    }));

    if (isCorrect) {
      sounds.playCorrect();
      speakText(currentQ.wordInSpanish, 'es');
    } else {
      sounds.playWrong();
    }
  };

  const handlePasapalabra = () => {
    if (isAnswerConfirmed) return;
    sounds.playPasapalabra();
    setStatuses((prev) => ({
      ...prev,
      [currentQ.letter]: 'passed',
    }));

    findAndGoNext(currentIdx);
  };

  const findAndGoNext = (fromIdx: number) => {
    const total = NUMEROS_QUESTIONS.length;
    for (let step = 1; step <= total; step++) {
      const nextIdx = (fromIdx + step) % total;
      const letter = NUMEROS_QUESTIONS[nextIdx].letter;
      if (statuses[letter] === 'pending' || statuses[letter] === 'passed') {
        updateQuestionState(nextIdx);
        return;
      }
    }
    // If all done
    setGameFinished(true);
    sounds.playFanfare();
    confetti({ particleCount: 150, spread: 80 });
  };

  const handleNext = () => {
    sounds.playSelect();
    const remaining = NUMEROS_QUESTIONS.filter(
      (q, idx) => idx !== currentIdx && (statuses[q.letter] === 'pending' || statuses[q.letter] === 'passed')
    );

    if (remaining.length === 0) {
      setGameFinished(true);
      sounds.playFanfare();
      confetti({ particleCount: 150, spread: 80 });
      return;
    }

    findAndGoNext(currentIdx);
  };

  const handleRestart = () => {
    sounds.playSelect();
    const initial: LetterStatus = {};
    NUMEROS_QUESTIONS.forEach((q) => {
      initial[q.letter] = 'pending';
    });
    setStatuses(initial);
    updateQuestionState(0);
    setTimeLeft(1200);
    setIsTimerRunning(true);
    setGameFinished(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 text-white select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-900/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-purple-300">
            <span className="font-mono font-black text-xl text-white">123</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-purple-200 via-pink-100 to-indigo-300 bg-clip-text text-transparent uppercase">
              Pasapalabra • Números en Español (Թվեր)
            </h1>
            <p className="text-xs sm:text-sm text-purple-300">
              Ասել թիվը իսպաներեն բառերով (27 թվեր • 347-ից մինչև 12 200)
            </p>
          </div>
        </div>

        {/* Controls: Mode & Scores */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-purple-800/60 text-xs">
            <button
              onClick={() => setMode('options')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                mode === 'options' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Ընտրել տարբերակներից"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Տարբերակներ</span>
            </button>
            <button
              onClick={() => setMode('oral')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                mode === 'oral' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Բանավոր պրակտիկա"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Բանավոր</span>
            </button>
            <button
              onClick={() => setMode('input')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                mode === 'input' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Գրել տեքստով"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Գրավոր</span>
            </button>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-emerald-300">{aciertos}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-xs">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span className="font-mono font-bold text-rose-300">{fallos}</span>
          </div>

          {/* 15 Min Timer Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/90 border border-purple-400/50 shadow-md">
            <Clock className="w-4 h-4 text-pink-400" />
            <span className="font-mono font-black text-white text-base">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              title={isTimerRunning ? 'Դադարեցնել' : 'Շարունակել'}
              className="text-pink-300 hover:text-white"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ROSCO CIRCLE WHEEL */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full flex items-center justify-center p-2 bg-gradient-to-b from-purple-950/40 to-slate-950/70 border border-purple-800/40 shadow-2xl">
            {/* Center Hub Displaying the Current Number */}
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-purple-900 via-slate-900 to-indigo-950 border-2 border-pink-400/50 flex flex-col items-center justify-center text-center p-3 shadow-inner relative overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300">
                Letra {currentQ.letter} ({currentIdx + 1}/27)
              </span>

              <span className="text-3xl sm:text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-100 to-purple-300 drop-shadow-md my-1.5">
                {currentQ.numStr}
              </span>

              <button
                type="button"
                onClick={() => speakText(currentQ.wordInSpanish, 'es')}
                title="Լսել իսպաներեն թիվը"
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 hover:bg-purple-500/40 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                <span>Լսել</span>
              </button>

              <button
                disabled={isAnswerConfirmed}
                onClick={handlePasapalabra}
                className="mt-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md cursor-pointer transition-transform hover:scale-105 disabled:opacity-30"
              >
                Pasapalabra
              </button>
            </div>

            {/* 27 Rosco Bubbles */}
            {NUMEROS_QUESTIONS.map((q, idx) => {
              const total = NUMEROS_QUESTIONS.length;
              const angleDeg = (idx / total) * 360 - 90;
              const angleRad = (angleDeg * Math.PI) / 180;
              const radiusPct = 43;
              const x = 50 + radiusPct * Math.cos(angleRad);
              const y = 50 + radiusPct * Math.sin(angleRad);

              const letter = q.letter;
              const status = statuses[letter] || 'pending';
              const isCurrent = idx === currentIdx;

              let bubbleClass = 'bg-gradient-to-b from-purple-600 via-indigo-700 to-purple-900 border-purple-300/60 text-white';
              if (status === 'correct') {
                bubbleClass = 'bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-800 border-emerald-300 text-white';
              } else if (status === 'wrong') {
                bubbleClass = 'bg-gradient-to-b from-rose-500 via-rose-700 to-rose-900 border-rose-300 text-white';
              } else if (status === 'passed') {
                bubbleClass = 'bg-gradient-to-b from-amber-400 via-yellow-600 to-amber-700 border-yellow-200 text-slate-950 font-black';
              }

              return (
                <button
                  key={letter}
                  onClick={() => {
                    if (!isAnswerConfirmed) updateQuestionState(idx);
                  }}
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
                  title={`${letter}: ${q.numStr}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* QUESTION & INTERACTIVE CONTROLS (Right 6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Main Question Card (Clickable to reveal Armenian!) */}
          <div
            onClick={() => setIsArmenianVisible(!isArmenianVisible)}
            className="group relative cursor-pointer p-6 rounded-3xl bg-gradient-to-b from-purple-950/80 via-slate-900 to-indigo-950 border-2 border-purple-500/50 hover:border-pink-400 shadow-2xl transition-all hover:scale-[1.01]"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/30 text-purple-200 font-semibold">
                  <Languages className="w-3.5 h-3.5" />
                  {isArmenianVisible
                    ? '🇦🇲 Հայերեն (Սեղմեք փակելու)'
                    : '🇪🇸 Իսպաներեն (Սեղմեք հայերեն տեսնելու համար)'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentQ.spanishText, 'es');
                  }}
                  title="Լսել հարցը"
                  className="p-2 rounded-xl bg-purple-800/60 hover:bg-pink-500/20 text-purple-200 hover:text-pink-300 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Spanish Question Text */}
              <div className="text-xl sm:text-2xl font-bold text-white text-center py-2">
                {currentQ.spanishText}
              </div>

              {/* Armenian Reveal */}
              <div
                className={`transition-all duration-300 overflow-hidden text-center rounded-2xl ${
                  isArmenianVisible
                    ? 'max-h-40 p-3 bg-purple-500/15 border border-purple-400/40 text-purple-100 text-base sm:text-lg font-medium'
                    : 'max-h-0 opacity-0'
                }`}
              >
                🇦🇲 {currentQ.armenianText}
              </div>

              <div className="text-center text-[11px] text-slate-400 group-hover:text-pink-300 transition-colors">
                👆 Սեղմեք այստեղ՝ թարգմանությունը {isArmenianVisible ? 'թաքցնելու' : 'տեսնելու'} համար
              </div>
            </div>
          </div>

          {/* Interactive Answer Modes */}
          {mode === 'options' && (
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Ընտրեք ճիշտ տարբերակը.
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {shuffledOptions.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt.trim().toLowerCase() === currentQ.wordInSpanish.trim().toLowerCase();

                  let style = 'border-purple-800/60 bg-gradient-to-r from-purple-950/70 to-slate-900 text-purple-100 hover:border-pink-400';
                  if (isAnswerConfirmed) {
                    if (isCorrect) {
                      style = 'border-emerald-400 bg-emerald-950/90 text-emerald-100 ring-2 ring-emerald-400/50';
                    } else if (isSelected && !isCorrect) {
                      style = 'border-rose-500 bg-rose-950/90 text-rose-100 ring-2 ring-rose-500/50';
                    } else {
                      style = 'border-slate-800 bg-slate-950/40 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswerConfirmed}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 rounded-2xl border-2 text-left font-semibold text-sm sm:text-base flex items-center justify-between transition-all cursor-pointer shadow-md ${style}`}
                    >
                      <span>{opt}</span>
                      {isAnswerConfirmed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isAnswerConfirmed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === 'input' && (
            <form onSubmit={handleCheckInput} className="flex flex-col gap-3">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Գրեք թիվը իսպաներեն տառերով.
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userTyped}
                  onChange={(e) => setUserTyped(e.target.value)}
                  disabled={isAnswerConfirmed}
                  placeholder="օրինակ՝ trescientos cuarenta y siete"
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border-2 border-purple-500/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-400"
                />
                <button
                  type="submit"
                  disabled={isAnswerConfirmed || !userTyped.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-sm text-white disabled:opacity-40 cursor-pointer shadow-md hover:brightness-110"
                >
                  Ստուգել
                </button>
              </div>
            </form>
          )}

          {mode === 'oral' && (
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/50 flex flex-col gap-3 text-center">
              <span className="text-sm text-purple-200">
                🗣️ Բարձրաձայն ասեք թիվը իսպաներենով, ապա սեղմեք <strong>«Բացահայտել»</strong>՝ ստուգելու համար։
              </span>
              {!isRevealed ? (
                <button
                  onClick={() => setIsRevealed(true)}
                  className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>Բացահայտել ճիշտ պատասխանը (Revelar)</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleSelfGradeOral(true)}
                    disabled={isAnswerConfirmed}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ճիշտ ասացի (¡Acerté!)</span>
                  </button>
                  <button
                    onClick={() => handleSelfGradeOral(false)}
                    disabled={isAnswerConfirmed}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Սխալվեցի (Fallé)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reveal & Pronounce Answer Card */}
          {isRevealed && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/80 via-slate-900 to-indigo-900/80 border-2 border-pink-400/80 flex items-center justify-between gap-3 shadow-xl animate-in fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-pink-300 font-bold">
                  Ճիշտ գրելաձևն ու արտասանությունը:
                </span>
                <span className="text-base sm:text-xl font-black text-white">
                  {currentQ.wordInSpanish}
                </span>
              </div>
              <button
                onClick={() => speakText(currentQ.wordInSpanish, 'es')}
                title="Լսել արտասանությունը"
                className="p-3 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/40 shrink-0 cursor-pointer transition-transform hover:scale-110"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Bottom Actions: Pasapalabra / Next */}
          <div className="flex items-center gap-3 pt-2">
            {!isAnswerConfirmed ? (
              <button
                onClick={handlePasapalabra}
                className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 active:scale-98"
              >
                <span>Pasapalabra (Բաց թողնել)</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 active:scale-98"
              >
                <span>Հաջորդ թիվը (Siguiente número)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Finish Card */}
          {gameFinished && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-2 border-pink-400 text-center flex flex-col items-center gap-3">
              <Trophy className="w-12 h-12 text-pink-400" />
              <h3 className="text-xl font-black text-white">¡Fin de los 27 números!</h3>
              <p className="text-sm text-purple-200">
                Ճիշտ: <strong className="text-emerald-400">{aciertos}</strong> | Սխալ: <strong className="text-rose-400">{fallos}</strong> (27 հարցից)
              </p>
              <button
                onClick={handleRestart}
                className="mt-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-pink-400 hover:bg-pink-300 text-slate-950 shadow-md flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Կրկին սկսել</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
