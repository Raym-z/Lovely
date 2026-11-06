"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Heart,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { LovelyContent, QuizQuestion } from "@/content/lovely";
import { usePersistentState } from "@/lib/use-persistent-state";
import { ConfettiEffect } from "./ConfettiEffect";
import { HeartShape, StarShape } from "./Doodles";
import {
  AccentPill,
  JourneyFooter,
  PrimaryButton,
  SectionIntro,
  Sticker,
} from "./ui";

interface QuizState {
  index: number;
  answers: Record<string, string>;
}

const initialQuiz: QuizState = { index: 0, answers: {} };

function scoreCopy(score: number, total: number) {
  if (score === total) {
    return {
      title: "A perfect score. Obviously.",
      note: "You know me by heart. I'm a little smug about it, honestly.",
    };
  }
  if (score >= total - 1) {
    return {
      title: "Almost perfect, just like us.",
      note: "One tiny miss. I'll forgive you if you hold my hand about it.",
    };
  }
  if (score >= Math.ceil(total / 2)) {
    return {
      title: "Halfway to knowing my whole heart.",
      note: "Good thing I love teaching you about me. More date nights required.",
    };
  }
  return {
    title: "Okay, we clearly need more date nights.",
    note: "I'm bringing flashcards. You're bringing snacks. It's a whole plan.",
  };
}

function ResultScreen({
  content,
  answers,
  score,
  burst,
  onPlayAgain,
}: {
  content: LovelyContent;
  answers: Record<string, string>;
  score: number;
  burst: number;
  onPlayAgain: () => void;
}) {
  const total = content.quiz.length;
  const copy = scoreCopy(score, total);
  const percent = Math.round((score / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="text-center"
    >
      <ConfettiEffect burst={burst} />

      <div className="mx-auto flex max-w-md flex-col items-center">
        <Sticker tone="butter">
          <Trophy className="h-3.5 w-3.5" />
          Quiz complete
        </Sticker>

        <div className="relative mt-8 grid h-32 w-32 place-items-center">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-pink-soft"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="absolute inset-2 rounded-full border-2 border-dashed border-strawberry/40" />
          <div className="relative flex flex-col items-center">
            <HeartShape className="mb-1 h-5 w-5 text-strawberry" />
            <span className="font-display text-4xl font-semibold leading-none text-ink">
              {score}
              <span className="text-xl text-ink-soft">/{total}</span>
            </span>
            <span className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink-soft/60">
              little hearts
            </span>
          </div>
          <motion.span
            aria-hidden="true"
            className="absolute -right-3 -top-2 text-butter"
            animate={{ rotate: [0, 18, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <StarShape className="h-7 w-7" />
          </motion.span>
        </div>

        <h3 className="mt-7 text-balance font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {copy.title}
        </h3>
        <p className="mt-3 max-w-sm font-hand text-xl leading-snug text-strawberry">
          {copy.note}
        </p>
        <div className="mt-4 w-full max-w-xs">
          <div className="h-2.5 overflow-hidden rounded-full bg-pink-soft/80">
            <motion.div
              className="h-full rounded-full bg-strawberry"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink-soft/55">
            {percent}% fluent in me
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border-2 border-dashed border-pink/70 bg-blush/35 p-4 text-left">
        <p className="mb-3 text-center font-hand text-xl text-[#8f4557]">
          the answers, just between us
        </p>
        <ul className="space-y-2.5">
          {content.quiz.map((question) => {
            const chosen = answers[question.id];
            const isCorrect = chosen === question.answer;
            const correctText = question.options.find(
              (option) => option.id === question.answer,
            )?.text;

            return (
              <li
                key={question.id}
                className="flex items-start gap-2.5 rounded-xl bg-white/70 px-3 py-2"
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white",
                    isCorrect ? "bg-[#5fb190]" : "bg-strawberry",
                  )}
                >
                  {isCorrect ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    <X className="h-3 w-3" strokeWidth={3} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-body text-xs font-semibold leading-snug text-ink">
                    {question.prompt}
                  </span>
                  <span className="mt-0.5 block font-body text-[0.7rem] leading-snug text-ink-soft">
                    {isCorrect ? "You got it." : `The answer: ${correctText}`}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button
          type="button"
          onClick={onPlayAgain}
          className="group inline-flex items-center gap-2 rounded-full border-2 border-ink/10 bg-white px-5 py-2.5 font-body text-sm font-semibold text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
        >
          <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45" />
          Play again
        </button>
      </div>
    </motion.div>
  );
}

export function CoupleQuiz({
  content,
  onContinue,
  onBack,
  storageNamespace,
}: {
  content: LovelyContent;
  onContinue: () => void;
  onBack: () => void;
  storageNamespace: string;
}) {
  const [quiz, setQuiz] = usePersistentState<QuizState>(
    `${storageNamespace}.quiz.v1`,
    initialQuiz,
  );
  const [burst, setBurst] = useState(0);

  const total = content.quiz.length;
  const finished = quiz.index >= total;
  const current: QuizQuestion | undefined = content.quiz[quiz.index];
  const selectedId = current ? quiz.answers[current.id] : undefined;
  const wasCorrect = current ? selectedId === current.answer : false;
  const score = content.quiz.reduce(
    (sum, question) =>
      sum + (quiz.answers[question.id] === question.answer ? 1 : 0),
    0,
  );

  function selectOption(optionId: string) {
    if (!current || selectedId) return;
    setQuiz((previous) => ({
      ...previous,
      answers: { ...previous.answers, [current.id]: optionId },
    }));
  }

  function nextQuestion() {
    if (quiz.index >= total - 1) {
      setQuiz((previous) => ({ ...previous, index: total }));
      setBurst((value) => value + 1);
      return;
    }
    setQuiz((previous) => ({ ...previous, index: previous.index + 1 }));
  }

  function playAgain() {
    setQuiz(initialQuiz);
  }

  const correctText = current?.options.find(
    (option) => option.id === current.answer,
  )?.text;

  return (
    <section>
      <SectionIntro
        eyebrow="Chapter Three · The Quiz"
        title={
          <>
            How well do you <span className="text-strawberry">actually</span>{" "}
            know me?
          </>
        }
        subtitle="Five extremely serious questions. Points will be awarded. Kisses may be deducted."
        note="no pressure... okay, a little pressure"
        eyebrowTone="butter"
      />

      <div className="relative mx-auto mt-10 max-w-2xl">
        <StarShape className="absolute -left-5 top-12 hidden h-8 w-8 rotate-[-12deg] text-butter sm:block" />
        <HeartShape className="absolute -right-4 bottom-24 hidden h-7 w-7 rotate-12 text-pink sm:block" />

        <div className="rounded-[2rem] border-2 border-white bg-white/85 p-5 shadow-lovely backdrop-blur-sm sm:p-8">
          {finished ? (
            <ResultScreen
              content={content}
              answers={quiz.answers}
              score={score}
              burst={burst}
              onPlayAgain={playAgain}
            />
          ) : current ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <AccentPill tone="butter">
                  <Sparkles className="h-3.5 w-3.5" />
                  Question {quiz.index + 1} of {total}
                </AccentPill>
                <div className="flex items-center gap-1.5">
                  {content.quiz.map((question, index) => {
                    const answered = Boolean(quiz.answers[question.id]);
                    const correct = quiz.answers[question.id] === question.answer;
                    return (
                      <span
                        key={question.id}
                        className={cn(
                          "h-2.5 rounded-full transition-all duration-300",
                          index === quiz.index
                            ? "w-7 bg-strawberry"
                            : answered
                              ? correct
                                ? "w-2.5 bg-[#79c4a7]"
                                : "w-2.5 bg-pink"
                              : "w-2.5 bg-ink/10",
                        )}
                      />
                    );
                  })}
                </div>
              </div>

              <h3 className="mt-6 text-balance font-display text-[1.6rem] font-semibold leading-tight text-ink sm:text-[2rem]">
                {current.prompt}
              </h3>
              <p className="mt-1.5 font-hand text-lg text-ink-soft">
                pick the one your heart says
              </p>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                {current.options.map((option, index) => {
                  const isCorrectOption = option.id === current.answer;
                  const isChosen = selectedId === option.id;
                  const hasAnswered = Boolean(selectedId);

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => selectOption(option.id)}
                      disabled={hasAnswered}
                      whileHover={hasAnswered ? undefined : { scale: 1.012 }}
                      whileTap={hasAnswered ? undefined : { scale: 0.985 }}
                      className={cn(
                        "group flex min-h-[4.2rem] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-body text-sm font-semibold transition-all duration-200",
                        !hasAnswered &&
                          "border-ink/10 bg-paper text-ink hover:border-pink hover:bg-blush/50",
                        hasAnswered &&
                          isCorrectOption &&
                          "border-[#79c4a7] bg-mint-soft text-[#2f7559]",
                        hasAnswered &&
                          isChosen &&
                          !isCorrectOption &&
                          "border-strawberry bg-blush text-[#a3324a]",
                        hasAnswered &&
                          !isCorrectOption &&
                          !isChosen &&
                          "border-ink/5 bg-paper/50 text-ink/40",
                        current.options.length % 2 === 1 &&
                          index === current.options.length - 1 &&
                          "sm:col-span-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-semibold transition-colors",
                          !hasAnswered &&
                            "border-ink/10 bg-white text-ink-soft group-hover:border-strawberry group-hover:text-strawberry",
                          hasAnswered &&
                            isCorrectOption &&
                            "border-[#79c4a7] bg-[#79c4a7] text-white",
                          hasAnswered &&
                            isChosen &&
                            !isCorrectOption &&
                            "border-strawberry bg-strawberry text-white",
                          hasAnswered &&
                            !isCorrectOption &&
                            !isChosen &&
                            "border-ink/10 bg-white/60 text-ink/40",
                        )}
                      >
                        {hasAnswered && isCorrectOption ? (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        ) : hasAnswered && isChosen ? (
                          <X className="h-4 w-4" strokeWidth={3} />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </span>
                      <span className="leading-snug">{option.text}</span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {selectedId ? (
                  <motion.div
                    key={selectedId}
                    initial={{ opacity: 0, y: 10, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "mt-5 rounded-2xl border-2 p-4",
                      wasCorrect
                        ? "border-[#9ed8c1] bg-mint-soft/70"
                        : "border-pink bg-blush/70",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-white",
                          wasCorrect ? "bg-[#5fb190]" : "bg-strawberry",
                        )}
                      >
                        <Heart className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-display text-[0.98rem] font-semibold text-ink">
                          {wasCorrect
                            ? "Right! You know me too well."
                            : "Not quite, but I love you anyway."}
                        </p>
                        <p className="mt-1 font-hand text-xl leading-snug text-[#7d4250]">
                          {wasCorrect
                            ? current.correctReaction
                            : current.wrongReaction}
                        </p>
                        {!wasCorrect ? (
                          <p className="mt-1.5 font-body text-xs text-ink-soft/80">
                            The answer was{" "}
                            <strong className="text-ink">{correctText}</strong>.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="font-hand text-lg text-ink-soft/60">
                  {selectedId
                    ? quiz.index === total - 1
                      ? "last one. deep breath."
                      : "okay, next one..."
                    : "take your time, sweetheart"}
                </p>
                <AnimatePresence mode="wait">
                  {selectedId ? (
                    <motion.div
                      key="next"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <PrimaryButton onClick={nextQuestion} icon={false}>
                        {quiz.index === total - 1
                          ? "See my score"
                          : "Next question"}
                        <Sparkles className="h-4 w-4" />
                      </PrimaryButton>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <JourneyFooter
        onBack={onBack}
        onContinue={onContinue}
        nextLabel="Next: a few little gifts"
        backLabel="Our story"
        note="the gifts are better than the score, I promise."
      />
    </section>
  );
}
