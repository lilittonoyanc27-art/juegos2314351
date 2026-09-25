import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PROBLEMAS_MATEMATICOS, MathProblem } from './quizData';
import { sounds } from './soundEffects';
import { speakText } from './speechHelper';
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Languages, 
  ArrowRight,
  ArrowLeft,
  Calculator,
  Eye,
  Trophy,
  HelpCircle
} from 'lucide-react';

export const ProblemasMatematicosGame: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isArmenianVisible, setIsArmenianVisible] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scores, setScores] = useState<Record<number, boolean>>({});
  const [gameFinished, setGameFinished] = useState(false);

  const problem: MathProblem = PROBLEMAS_MATEMATICOS[currentIdx];

  // Generate 4 plausible choices for multiple choice
  const generateChoices = (prob: MathProblem) => {
    const correct = prob.result;
    const deltas = [-prob.result * 0.1, prob.result * 0.1, prob.result * 0.2, 50, -20, 10];
    const unique = new Set<number>([correct]);
    for (const d of deltas) {
      if (unique.size >= 4) break;
      const fake = Math.round(correct + d);
      if (fake > 0 && fake !== correct) {
        unique.add(fake);
      }
    }
    // fallback if set still small
    while (unique.size < 4) {
      unique.add(correct + (unique.size * 15));
    }
    return Array.from(unique).sort(() => 0.5 - Math.random());
  };

  const [choices, setChoices] = useState<number[]>(() => generateChoices(problem));

  const changeProblem = (newIdx: number) => {
    setCurrentIdx(newIdx);
    setChoices(generateChoices(PROBLEMAS_MATEMATICOS[newIdx]));
    setIsArmenianVisible(false);
    setUserAnswer('');
    setSelectedChoice(null);
    setIsAnswerConfirmed(false);
    setIsRevealed(false);
  };

  const handleSelectChoice = (val: number) => {
    if (isAnswerConfirmed) return;
    setSelectedChoice(val);
    setIsAnswerConfirmed(true);
    setIsRevealed(true);

    const isCorrect = val === problem.result;
    setScores((prev) => ({ ...prev, [problem.id]: isCorrect }));

    if (isCorrect) {
      sounds.playCorrect();
      speakText(`${val} ${problem.unitEs}`, 'es');
    } else {
      sounds.playWrong();
    }
  };

  const handleSubmitInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseFloat(userAnswer.replace(/\s+/g, '').replace(',', '.'));
    if (isNaN(num)) return;

    handleSelectChoice(num);
  };

  const handleNext = () => {
    sounds.playSelect();
    if (currentIdx < PROBLEMAS_MATEMATICOS.length - 1) {
      changeProblem(currentIdx + 1);
    } else {
      setGameFinished(true);
      sounds.playFanfare();
      confetti({ particleCount: 150, spread: 80 });
    }
  };

  const handlePrev = () => {
    sounds.playSelect();
    if (currentIdx > 0) {
      changeProblem(currentIdx - 1);
    }
  };

  const handleRestart = () => {
    sounds.playSelect();
    setScores({});
    setGameFinished(false);
    changeProblem(0);
  };

  const solvedCount = Object.keys(scores).length;
  const correctCount = Object.values(scores).filter(Boolean).length;

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 text-white select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-900/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-300 bg-clip-text text-transparent uppercase">
              Problemas Matemáticos (Մաթեմատիկական խնդիրներ)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-300">
              Իսպաներեն բանավոր պրակտիկա + հայերեն թարգմանություն (15 խնդիր)
            </p>
          </div>
        </div>

        {/* Progress & Scores */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-800/60 text-xs">
            <span className="text-slate-400">Խնդիր:</span>
            <span className="font-mono font-bold text-emerald-300">{currentIdx + 1} / 15</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-emerald-300">{correctCount}</span>
            <span className="text-slate-400">/ {solvedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Problem Display */}
      <div className="flex flex-col gap-6">
        {/* Step indicator bar */}
        <div className="grid grid-cols-15 gap-1.5">
          {PROBLEMAS_MATEMATICOS.map((p, idx) => {
            const isDone = scores[p.id] !== undefined;
            const isGood = scores[p.id] === true;
            const isCurrent = idx === currentIdx;

            let barColor = 'bg-slate-800 border-slate-700';
            if (isCurrent) {
              barColor = 'bg-teal-400 ring-2 ring-teal-300 ring-offset-2 ring-offset-slate-950 scale-110';
            } else if (isDone && isGood) {
              barColor = 'bg-emerald-500 border-emerald-400';
            } else if (isDone && !isGood) {
              barColor = 'bg-rose-500 border-rose-400';
            }

            return (
              <button
                key={p.id}
                onClick={() => changeProblem(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${barColor}`}
                title={`Խնդիր ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Problem Card (Clickable to reveal Armenian!) */}
        <div
          onClick={() => setIsArmenianVisible(!isArmenianVisible)}
          className="group relative cursor-pointer p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-teal-950/80 via-slate-900 to-indigo-950 border-2 border-teal-500/50 hover:border-teal-300 shadow-2xl transition-all hover:scale-[1.01]"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/30 text-teal-200 font-semibold">
                <Languages className="w-3.5 h-3.5" />
                {isArmenianVisible
                  ? '🇦🇲 Հայերեն թարգմանություն (Սեղմեք փակելու)'
                  : '🇪🇸 Իսպաներեն (Սեղմեք հայերեն տեսնելու համար)'}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(problem.spanish, 'es');
                }}
                title="Լսել խնդիրը իսպաներենով"
                className="p-2.5 rounded-xl bg-teal-800/60 hover:bg-teal-500/20 text-teal-200 hover:text-teal-300 transition-colors flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-semibold hidden sm:inline">Լսել</span>
              </button>
            </div>

            {/* Spanish Problem Text */}
            <div className="text-xl sm:text-2xl font-bold text-white leading-relaxed text-center py-2">
              <span className="text-teal-400 mr-2 font-mono font-black">#{problem.id}</span>
              {problem.spanish}
            </div>

            {/* Armenian Translation Reveal */}
            <div
              className={`transition-all duration-300 overflow-hidden text-center rounded-2xl ${
                isArmenianVisible
                  ? 'max-h-48 p-4 bg-teal-500/15 border border-teal-400/40 text-teal-100 text-base sm:text-xl font-medium'
                  : 'max-h-0 opacity-0'
              }`}
            >
              🇦🇲 {problem.armenian}
            </div>

            <div className="text-center text-xs text-slate-400 group-hover:text-teal-300 transition-colors">
              👆 Սեղմեք այստեղ՝ թարգմանությունը {isArmenianVisible ? 'թաքցնելու' : 'տեսնելու'} համար
            </div>
          </div>
        </div>

        {/* Input & Multiple Choice Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Multiple choice options */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Ընտրեք պատասխանը.
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {choices.map((val) => {
                const isSelected = selectedChoice === val;
                const isCorrect = val === problem.result;

                let style = 'border-teal-800/60 bg-gradient-to-r from-teal-950/70 to-slate-900 text-teal-100 hover:border-teal-400';
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
                    key={val}
                    disabled={isAnswerConfirmed}
                    onClick={() => handleSelectChoice(val)}
                    className={`p-3 rounded-2xl border-2 font-mono font-bold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${style}`}
                  >
                    <span>{val.toLocaleString()}</span>
                    <span className="text-xs font-sans text-slate-400 font-normal">{problem.unitEs}</span>
                    {isAnswerConfirmed && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isAnswerConfirmed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typing manual answer */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Կամ գրեք ձեր հաշված թիվը.
            </span>
            <form onSubmit={handleSubmitInput} className="flex gap-2">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isAnswerConfirmed}
                placeholder="օրինակ՝ 500"
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border-2 border-teal-500/60 text-white placeholder-slate-500 text-base focus:outline-none focus:border-teal-300 font-mono font-bold"
              />
              <button
                type="submit"
                disabled={isAnswerConfirmed || !userAnswer.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 font-bold text-sm text-white disabled:opacity-40 cursor-pointer shadow-md hover:brightness-110"
              >
                Ստուգել
              </button>
            </form>

            <button
              onClick={() => setIsRevealed(!isRevealed)}
              className="mt-1 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isRevealed ? 'Թաքցնել լուծումը' : 'Տեսնել քայլ առ քայլ լուծումը (Ver solución)'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Explanation Box */}
        {isRevealed && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border-2 border-teal-400 shadow-xl flex flex-col gap-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-teal-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-teal-400/20 text-teal-300 font-mono font-black text-sm border border-teal-400/30">
                  {problem.operation}
                </span>
                <span className="text-xs text-slate-300">
                  = {problem.result.toLocaleString()} {problem.unitEs} ({problem.unitHy})
                </span>
              </div>
              <button
                onClick={() => speakText(`${problem.explanationEs}`, 'es')}
                className="p-2 rounded-xl bg-teal-800/40 hover:bg-teal-700/50 text-teal-300 transition-colors"
                title="Լսել բացատրությունը իսպաներենով"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm space-y-1.5">
              <p className="text-emerald-200">
                🇪🇸 <strong>Explicación:</strong> {problem.explanationEs}
              </p>
              <p className="text-amber-200">
                🇦🇲 <strong>Լուծում:</strong> {problem.explanationHy}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Bar: Prev / Next */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Նախորդը (Anterior)</span>
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/30 flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <span>{currentIdx < PROBLEMAS_MATEMATICOS.length - 1 ? 'Հաջորդ խնդիրը (Siguiente)' : 'Ավարտել (Finalizar)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Finish Summary */}
        {gameFinished && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 border-2 border-teal-400 text-center flex flex-col items-center gap-3">
            <Trophy className="w-12 h-12 text-teal-300" />
            <h3 className="text-xl font-black text-white">¡Todos los problemas completados!</h3>
            <p className="text-sm text-teal-200">
              Ճիշտ եք լուծել: <strong className="text-emerald-400">{correctCount}</strong> / 15 խնդիրներից
            </p>
            <button
              onClick={handleRestart}
              className="mt-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-md flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Վերսկսել խնդիրները</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
