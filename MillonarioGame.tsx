import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MILLONARIO_QUESTIONS, MultipleChoiceQuestion } from './quizData';
import { sounds } from './soundEffects';
import { speakText } from './speechHelper';
import { 
  Volume2, 
  HelpCircle, 
  PhoneCall, 
  Users, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Languages, 
  ArrowRight,
  Trophy,
  Award
} from 'lucide-react';

interface MillonarioGameProps {
  onBackToMenu?: () => void;
}

export const MillonarioGame: React.FC<MillonarioGameProps> = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<'a' | 'b' | 'c' | 'd' | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [isArmenianVisible, setIsArmenianVisible] = useState(false);
  const [scoreCorrect, setScoreCorrect] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // Lifelines
  const [lifeline50Used, setLifeline50Used] = useState(false);
  const [lifelineAudienceUsed, setLifelineAudienceUsed] = useState(false);
  const [lifelinePhoneUsed, setLifelinePhoneUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [audienceVotes, setAudienceVotes] = useState<Record<string, number> | null>(null);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);
  const [showLadderMobile, setShowLadderMobile] = useState(false);

  const currentQ: MultipleChoiceQuestion = MILLONARIO_QUESTIONS[currentIndex];

  const handleSelectOption = (key: 'a' | 'b' | 'c' | 'd') => {
    if (isAnswerConfirmed || hiddenOptions.includes(key)) return;
    sounds.playDramaticLock();
    setSelectedKey(key);
    setIsAnswerConfirmed(true);

    const isCorrect = key === currentQ.correct;
    if (isCorrect) {
      sounds.playCorrect();
      setScoreCorrect((prev) => prev + 1);
      if (currentIndex === MILLONARIO_QUESTIONS.length - 1) {
        sounds.playFanfare();
        confetti({ particleCount: 150, spread: 80 });
      }
    } else {
      sounds.playWrong();
    }
  };

  const handleNextQuestion = () => {
    sounds.playSelect();
    if (currentIndex < MILLONARIO_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedKey(null);
      setIsAnswerConfirmed(false);
      setIsArmenianVisible(false);
      setHiddenOptions([]);
      setAudienceVotes(null);
      setPhoneMessage(null);
    } else {
      setGameFinished(true);
      sounds.playFanfare();
      confetti({ particleCount: 120, spread: 90 });
    }
  };

  const handleRestart = () => {
    sounds.playSelect();
    setCurrentIndex(0);
    setSelectedKey(null);
    setIsAnswerConfirmed(false);
    setIsArmenianVisible(false);
    setScoreCorrect(0);
    setGameFinished(false);
    setLifeline50Used(false);
    setLifelineAudienceUsed(false);
    setLifelinePhoneUsed(false);
    setHiddenOptions([]);
    setAudienceVotes(null);
    setPhoneMessage(null);
  };

  // Lifelines actions
  const useLifeline5050 = () => {
    if (lifeline50Used || isAnswerConfirmed) return;
    sounds.playLifeline();
    setLifeline50Used(true);

    const wrongKeys = currentQ.options
      .map((o) => o.key)
      .filter((k) => k !== currentQ.correct);
    
    // Pick 2 random wrong options to hide
    const shuffled = [...wrongKeys].sort(() => 0.5 - Math.random());
    setHiddenOptions(shuffled.slice(0, 2));
  };

  const useLifelineAudience = () => {
    if (lifelineAudienceUsed || isAnswerConfirmed) return;
    sounds.playLifeline();
    setLifelineAudienceUsed(true);

    const correctKey = currentQ.correct;
    // Audience strongly favors the correct answer (e.g., 65-85%)
    const correctPct = Math.floor(Math.random() * 20) + 65;
    const remaining = 100 - correctPct;
    const wrongKeys = (['a', 'b', 'c', 'd'] as const).filter((k) => k !== correctKey);
    
    const p1 = Math.floor(remaining * 0.5);
    const p2 = Math.floor(remaining * 0.3);
    const p3 = remaining - p1 - p2;

    const votes: Record<string, number> = {
      [correctKey]: correctPct,
      [wrongKeys[0]]: p1,
      [wrongKeys[1]]: p2,
      [wrongKeys[2]]: p3,
    };
    setAudienceVotes(votes);
  };

  const useLifelinePhone = () => {
    if (lifelinePhoneUsed || isAnswerConfirmed) return;
    sounds.playLifeline();
    setLifelinePhoneUsed(true);

    const opt = currentQ.options.find((o) => o.key === currentQ.correct);
    const friendAdviceEs = `¡Hola! Estoy 90% seguro de que la respuesta correcta es la "${currentQ.correct.toUpperCase()}) ${opt?.text}".`;
    const friendAdviceHy = `Բարև, 90%-ով վստահ եմ, որ ճիշտ տարբերակն է՝ "${currentQ.correct.toUpperCase()}) ${opt?.text}"։`;
    setPhoneMessage(`${friendAdviceEs}\n${friendAdviceHy}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 text-white select-none">
      {/* Top Banner / Show Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-900/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-300/40">
            <Trophy className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent uppercase">
              ¿Quién quiere ser millonario?
            </h1>
            <p className="text-xs sm:text-sm text-indigo-300">
              Ո՞վ է ուզում դառնալ միլիոնատեր • ser / estar / tener / tener que + clima
            </p>
          </div>
        </div>

        {/* Lifelines Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 50:50 */}
          <button
            onClick={useLifeline5050}
            disabled={lifeline50Used || isAnswerConfirmed || gameFinished}
            title="50:50 - Հեռացնել 2 սխալ պատասխան"
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5 shadow-md ${
              lifeline50Used
                ? 'opacity-30 border-slate-700 bg-slate-900/40 cursor-not-allowed line-through text-slate-500'
                : 'border-amber-400/60 bg-gradient-to-b from-indigo-900 to-slate-900 hover:from-amber-500/20 text-amber-300 hover:border-amber-300'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>50:50</span>
          </button>

          {/* Ask Audience */}
          <button
            onClick={useLifelineAudience}
            disabled={lifelineAudienceUsed || isAnswerConfirmed || gameFinished}
            title="Público - Դահլիճի օգնություն"
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5 shadow-md ${
              lifelineAudienceUsed
                ? 'opacity-30 border-slate-700 bg-slate-900/40 cursor-not-allowed line-through text-slate-500'
                : 'border-cyan-400/60 bg-gradient-to-b from-indigo-900 to-slate-900 hover:from-cyan-500/20 text-cyan-300 hover:border-cyan-300'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Público</span>
          </button>

          {/* Phone a Friend */}
          <button
            onClick={useLifelinePhone}
            disabled={lifelinePhoneUsed || isAnswerConfirmed || gameFinished}
            title="Llamada - Զանգ ընկերոջը"
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5 shadow-md ${
              lifelinePhoneUsed
                ? 'opacity-30 border-slate-700 bg-slate-900/40 cursor-not-allowed line-through text-slate-500'
                : 'border-emerald-400/60 bg-gradient-to-b from-indigo-900 to-slate-900 hover:from-emerald-500/20 text-emerald-300 hover:border-emerald-300'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Llamada</span>
          </button>

          {/* Mobile Ladder Toggle */}
          <button
            onClick={() => setShowLadderMobile(!showLadderMobile)}
            className="lg:hidden px-3 py-2 rounded-xl text-xs font-bold border border-indigo-500/50 bg-indigo-950 text-indigo-200"
          >
            {showLadderMobile ? 'Փակել' : 'Սանդուղք'}
          </button>
        </div>
      </div>

      {/* Main Studio Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Game Area (Left 8-9 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Question Counter & Prize Header */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-indigo-300">
              <span className="font-semibold">Pregunta {currentIndex + 1} / 15</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{scoreCorrect} ճիշտ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Premio actual:</span>
              <span className="px-2.5 py-0.5 rounded-md font-mono font-extrabold text-amber-300 bg-amber-500/10 border border-amber-400/40 shadow-sm">
                {currentQ.prize}
              </span>
            </div>
          </div>

          {/* Audience Poll Modal Overlay if used */}
          {audienceVotes && (
            <div className="p-4 rounded-2xl bg-indigo-950 border border-cyan-400/60 shadow-xl shadow-cyan-950/50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-indigo-800">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Դահլիճի քվեարկության արդյունքներ (Votos del público)
                </span>
                <button
                  onClick={() => setAudienceVotes(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Փակել
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                {(['a', 'b', 'c', 'd'] as const).map((k) => (
                  <div key={k} className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      {k}) {audienceVotes[k]}%
                    </span>
                    <div className="w-full bg-slate-900 rounded-full h-20 flex items-end p-1">
                      <div
                        className={`w-full rounded-full transition-all duration-700 ${
                          k === currentQ.correct
                            ? 'bg-gradient-to-t from-cyan-500 to-emerald-400'
                            : 'bg-indigo-700'
                        }`}
                        style={{ height: `${Math.max(audienceVotes[k], 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phone Friend Advice Box */}
          {phoneMessage && (
            <div className="p-4 rounded-2xl bg-indigo-950 border border-emerald-400/60 shadow-xl shadow-emerald-950/50 flex items-start gap-3 animate-in fade-in">
              <PhoneCall className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-100 whitespace-pre-line leading-relaxed">
                {phoneMessage}
              </div>
              <button
                onClick={() => setPhoneMessage(null)}
                className="text-xs text-slate-400 hover:text-white ml-auto"
              >
                ✕
              </button>
            </div>
          )}

          {/* THE QUESTION CARD (Clickable to reveal Armenian!) */}
          <div
            onClick={() => setIsArmenianVisible(!isArmenianVisible)}
            className="group relative cursor-pointer p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-900/90 via-slate-900 to-indigo-950 border-2 border-amber-400/50 hover:border-amber-300 shadow-2xl shadow-indigo-950/80 transition-all hover:scale-[1.01]"
          >
            {/* Visual studio accent glow lines */}
            <div className="absolute inset-x-8 -top-0.5 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <div className="absolute inset-x-8 -bottom-0.5 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold">
                  <Languages className="w-3.5 h-3.5" />
                  {isArmenianVisible
                    ? '🇦🇲 Հայերեն թարգմանություն (Սեղմեք փակելու համար)'
                    : '🇪🇸 Իսպաներեն (Սեղմեք հայերեն թարգմանությունը տեսնելու համար)'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentQ.spanish, 'es');
                  }}
                  title="Լսել իսպաներեն արտասանությունը"
                  className="p-2 rounded-xl bg-indigo-800/60 hover:bg-amber-500/20 text-indigo-200 hover:text-amber-300 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Spanish Question */}
              <div className="text-xl sm:text-3xl font-extrabold text-center text-white tracking-wide leading-relaxed py-2">
                {currentQ.spanish}
              </div>

              {/* Armenian Translation Reveal */}
              <div
                className={`transition-all duration-300 overflow-hidden text-center rounded-2xl ${
                  isArmenianVisible
                    ? 'max-h-40 p-3 bg-amber-500/10 border border-amber-400/40 text-amber-200 text-base sm:text-xl font-medium'
                    : 'max-h-0 opacity-0'
                }`}
              >
                🇦🇲 {currentQ.armenian}
              </div>

              <div className="text-center text-[11px] text-slate-400 group-hover:text-amber-300/80 transition-colors flex items-center justify-center gap-1">
                <span>👆</span> Սեղմեք այստեղ՝ թարգմանությունը {isArmenianVisible ? 'թաքցնելու' : 'տեսնելու'} համար (Haz clic para ver la traducción en armenio)
              </div>
            </div>
          </div>

          {/* 4 OPTIONS GRID (Classic A, B, C, D) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options.map((opt) => {
              const isHidden = hiddenOptions.includes(opt.key);
              if (isHidden) {
                return (
                  <div
                    key={opt.key}
                    className="h-16 rounded-2xl border border-slate-800/40 bg-slate-950/20 opacity-20 pointer-events-none"
                  />
                );
              }

              const isSelected = selectedKey === opt.key;
              const isCorrectAnswer = opt.key === currentQ.correct;

              let btnStyle = 'border-indigo-700/60 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-indigo-100 hover:border-amber-400 hover:text-white';
              let badgeStyle = 'text-amber-400 bg-amber-400/10 border-amber-400/30';

              if (isAnswerConfirmed) {
                if (isCorrectAnswer) {
                  // Always highlight correct in Green
                  btnStyle = 'border-emerald-400 bg-emerald-950/90 text-emerald-100 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950';
                  badgeStyle = 'text-emerald-300 bg-emerald-400/20 border-emerald-400';
                } else if (isSelected && !isCorrectAnswer) {
                  // User chose wrong answer -> Red
                  btnStyle = 'border-rose-500 bg-rose-950/90 text-rose-100 ring-2 ring-rose-500/50 shadow-lg shadow-rose-950';
                  badgeStyle = 'text-rose-300 bg-rose-500/20 border-rose-500';
                } else {
                  btnStyle = 'border-slate-800/50 bg-slate-950/40 text-slate-500 opacity-60';
                  badgeStyle = 'text-slate-600 bg-slate-800/30 border-slate-700';
                }
              } else if (isSelected) {
                btnStyle = 'border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-400 shadow-lg shadow-amber-950';
                badgeStyle = 'text-amber-300 bg-amber-400/20 border-amber-400';
              }

              return (
                <button
                  key={opt.key}
                  disabled={isAnswerConfirmed}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`group relative flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer shadow-md ${btnStyle}`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center border shrink-0 transition-colors uppercase ${badgeStyle}`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-base sm:text-lg font-bold tracking-wide flex-1">
                    {opt.text}
                  </span>
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

          {/* Feedback & Continue Area (Allows Continuing Even If Wrong!) */}
          {isAnswerConfirmed && (
            <div
              className={`p-5 rounded-2xl border-2 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                selectedKey === currentQ.correct
                  ? 'bg-emerald-950/70 border-emerald-500/80 shadow-lg shadow-emerald-950/60'
                  : 'bg-rose-950/70 border-rose-500/80 shadow-lg shadow-rose-950/60'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedKey === currentQ.correct ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
                )}
                <div className="flex-1">
                  <div className="font-black text-base sm:text-lg">
                    {selectedKey === currentQ.correct ? (
                      <span className="text-emerald-300">¡Correcto! Ճիշտ պատասխան (+{currentQ.prize})</span>
                    ) : (
                      <span className="text-rose-300">
                        Սխալ պատասխան, բայց խաղը շարունակվում է։ Ճիշտ տարբերակն է՝{' '}
                        <span className="underline font-black text-white">
                          {currentQ.correct.toUpperCase()}) {currentQ.options.find((o) => o.key === currentQ.correct)?.text}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 mt-1 space-y-0.5">
                    <p>💡 <strong>Իսպաներեն բացատրություն:</strong> {currentQ.explanationEs}</p>
                    <p>🇦🇲 <strong>Հայերեն բացատրություն:</strong> {currentQ.explanationHy}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <span>{currentIndex < MILLONARIO_QUESTIONS.length - 1 ? 'Հաջորդ հարցը (Siguiente)' : 'Արդյունքներ (Ver resultados)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* End Game Final Results Card */}
          {gameFinished && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950/60 border-2 border-amber-400 shadow-2xl text-center flex flex-col items-center gap-4">
              <Award className="w-16 h-16 text-amber-400" />
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ¡Fin de la partida! / Խաղն ավարտվեց:
              </h2>
              <p className="text-base sm:text-lg text-amber-200">
                Դուք ճիշտ եք պատասխանել <strong>{scoreCorrect} / 15</strong> հարցերի:
              </p>
              <p className="text-xs text-slate-300 max-w-md">
                Գերազանց աշխատանք: Դուք վարժվեցիք <strong>ser / estar / tener / tener que + clima</strong> կանոններին:
              </p>
              <button
                onClick={handleRestart}
                className="mt-2 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/40 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Կրկին խաղալ (Jugar de nuevo)</span>
              </button>
            </div>
          )}
        </div>

        {/* LADDER ON THE RIGHT (Classic 15 Levels) */}
        <div
          className={`lg:col-span-4 rounded-3xl bg-slate-950/80 border border-indigo-900/80 p-4 shadow-2xl ${
            showLadderMobile ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Մրցանակային սանդուղք
            </span>
            <span className="text-[11px] text-slate-400">15 մակարդակ</span>
          </div>

          <div className="flex flex-col-reverse gap-1 font-mono text-xs sm:text-sm">
            {MILLONARIO_QUESTIONS.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isPassed = idx < currentIndex;
              const isMilestone = idx === 4 || idx === 9 || idx === 14;

              let rowStyle = 'text-indigo-300/80 hover:bg-indigo-900/20';
              if (isCurrent) {
                rowStyle = 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md ring-1 ring-amber-300';
              } else if (isPassed) {
                rowStyle = 'text-emerald-400/90 font-medium';
              } else if (isMilestone) {
                rowStyle = 'text-amber-300 font-bold';
              }

              return (
                <div
                  key={q.id}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-all ${rowStyle}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-right font-bold opacity-80">
                      {q.id}
                    </span>
                    <span className="text-xs">
                      {isMilestone && !isCurrent ? '◆' : '◇'}
                    </span>
                  </div>
                  <span className="font-extrabold tracking-wider">{q.prize}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-900/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>◆ Անվտանգ գոտիներ</span>
            <button
              onClick={handleRestart}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Վերսկսել</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
