"use client";

import type { Dispatch, SetStateAction } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LovelyContent, QuizOption, QuizQuestion } from "@/content/lovely";
import { cn } from "@/lib/cn";
import { makeId } from "@/lib/ids";
import {
  AddButton,
  CollapsibleCard,
  EditorCard,
  Field,
  RemoveButton,
  TextArea,
  TextInput,
} from "../fields";

function nextOptionLabel(index: number) {
  return index < 26
    ? `Option ${String.fromCharCode(65 + index)}`
    : `Option ${index + 1}`;
}

function isTrueFalseOptions(options: QuizOption[]) {
  if (options.length !== 2) return false;
  const texts = options.map((option) => option.text.trim().toLowerCase());
  return texts.includes("true") && texts.includes("false");
}

function newQuestion(): QuizQuestion {
  const options = ["A", "B", "C", "D"].map((letter) => ({
    id: makeId("option"),
    text: `Option ${letter}`,
  }));

  return {
    id: makeId("question"),
    prompt: "A new question about me",
    options,
    answer: options[0].id,
    correctReaction:
      "You got it. I'm a little impressed, and a lot in love with you.",
    wrongReaction:
      "Not quite — but honestly, I love that you guessed. The answer is on me.",
  };
}

export function QuizStep({
  content,
  setContent,
  activeQuestionId,
  onActiveQuestionChange,
}: {
  content: LovelyContent;
  setContent: Dispatch<SetStateAction<LovelyContent>>;
  activeQuestionId: string | null;
  onActiveQuestionChange: (id: string | null) => void;
}) {
  function updateQuestion(index: number, patch: Partial<QuizQuestion>) {
    setContent((previous) => ({
      ...previous,
      quiz: previous.quiz.map((question, itemIndex) =>
        itemIndex === index ? { ...question, ...patch } : question,
      ),
    }));
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    text: string,
  ) {
    setContent((previous) => ({
      ...previous,
      quiz: previous.quiz.map((question, itemIndex) =>
        itemIndex === questionIndex
          ? {
              ...question,
              options: question.options.map((option, index) =>
                index === optionIndex ? { ...option, text } : option,
              ),
            }
          : question,
      ),
    }));
  }

  function addOption(questionIndex: number) {
    setContent((previous) => ({
      ...previous,
      quiz: previous.quiz.map((question, itemIndex) => {
        if (itemIndex !== questionIndex) return question;

        const option = {
          id: makeId("option"),
          text: nextOptionLabel(question.options.length),
        };

        return { ...question, options: [...question.options, option] };
      }),
    }));
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setContent((previous) => ({
      ...previous,
      quiz: previous.quiz.map((question, itemIndex) => {
        if (itemIndex !== questionIndex || question.options.length <= 2) {
          return question;
        }

        const removed = question.options[optionIndex];
        const options = question.options.filter(
          (_, index) => index !== optionIndex,
        );
        const answer =
          removed.id === question.answer ||
          !options.some((option) => option.id === question.answer)
            ? options[0].id
            : question.answer;

        return { ...question, options, answer };
      }),
    }));
  }

  function moveOption(
    questionIndex: number,
    optionIndex: number,
    direction: -1 | 1,
  ) {
    setContent((previous) => ({
      ...previous,
      quiz: previous.quiz.map((question, itemIndex) => {
        if (itemIndex !== questionIndex) return question;

        const target = optionIndex + direction;
        if (target < 0 || target >= question.options.length) return question;

        const options = [...question.options];
        [options[optionIndex], options[target]] = [
          options[target],
          options[optionIndex],
        ];

        return { ...question, options };
      }),
    }));
  }

  function applyTrueFalse(questionIndex: number) {
    setContent((previous) => ({
      ...previous,
      quiz: previous.quiz.map((question, itemIndex) => {
        if (itemIndex !== questionIndex) return question;

        const trueOption = { id: makeId("option"), text: "True" };
        const falseOption = { id: makeId("option"), text: "False" };
        const previousAnswer = question.options
          .find((option) => option.id === question.answer)
          ?.text.trim()
          .toLowerCase();

        return {
          ...question,
          options: [trueOption, falseOption],
          answer:
            previousAnswer === "false" ? falseOption.id : trueOption.id,
        };
      }),
    }));
  }

  function applyMultipleChoice(questionIndex: number) {
    setContent((previous) => ({
      ...previous,
      quiz: previous.quiz.map((question, itemIndex) => {
        if (itemIndex !== questionIndex) return question;
        if (!isTrueFalseOptions(question.options)) return question;

        const option = {
          id: makeId("option"),
          text: nextOptionLabel(question.options.length),
        };

        return { ...question, options: [...question.options, option] };
      }),
    }));
  }

  function addQuestion() {
    if (content.quiz.length >= 10) return;
    const question = newQuestion();
    setContent((previous) => {
      if (previous.quiz.length >= 10) return previous;
      return { ...previous, quiz: [...previous.quiz, question] };
    });
    onActiveQuestionChange(question.id);
  }

  function removeQuestion(index: number) {
    if (content.quiz.length <= 1) return;
    const removed = content.quiz[index];
    setContent((previous) => ({
      ...previous,
      quiz: previous.quiz.filter((_, itemIndex) => itemIndex !== index),
    }));
    if (removed.id === activeQuestionId) {
      onActiveQuestionChange(null);
    }
  }

  return (
    <div className="space-y-5">
      <EditorCard
        title="How well do they know you?"
        description="Up to ten little questions, each with two or more answers. Pick the correct answer and write two reactions: one for getting it right, one for getting it wonderfully wrong."
        accent="butter"
      >
        <div className="space-y-3">
          {content.quiz.map((question, questionIndex) => (
            <CollapsibleCard
              key={question.id}
              title={question.prompt || `Question ${questionIndex + 1}`}
              subtitle={
                isTrueFalseOptions(question.options)
                  ? "True or false, one correct"
                  : `${question.options.length} answers, one correct`
              }
              badge={`Q${questionIndex + 1}`}
              open={activeQuestionId === question.id}
              onOpenChange={(open) =>
                onActiveQuestionChange(open ? question.id : null)
              }
              onRemove={() => removeQuestion(questionIndex)}
              removeDisabled={content.quiz.length <= 1}
            >
              <Field label="Question" required>
                <TextArea
                  rows={2}
                  value={question.prompt}
                  onChange={(event) =>
                    updateQuestion(questionIndex, {
                      prompt: event.target.value,
                    })
                  }
                  maxLength={300}
                />
              </Field>

              <fieldset>
                <legend className="sr-only">Answer options</legend>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1 font-body text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-soft/75">
                    Answer options
                    <span className="font-hand text-sm normal-case tracking-normal text-strawberry">
                      · click the dot to mark the correct one
                    </span>
                  </span>
                  <div className="flex items-center gap-1 rounded-full border-2 border-ink/5 bg-white/60 p-1">
                    <button
                      type="button"
                      aria-pressed={!isTrueFalseOptions(question.options)}
                      onClick={() => {
                        if (isTrueFalseOptions(question.options)) {
                          applyMultipleChoice(questionIndex);
                        }
                      }}
                      className={cn(
                        "rounded-full px-2.5 py-1.5 font-body text-[0.55rem] font-bold uppercase tracking-[0.1em] transition-colors",
                        isTrueFalseOptions(question.options)
                          ? "text-ink-soft hover:bg-blush hover:text-strawberry"
                          : "bg-strawberry text-white",
                      )}
                    >
                      Multiple choice
                    </button>
                    <button
                      type="button"
                      aria-pressed={isTrueFalseOptions(question.options)}
                      onClick={() => {
                        if (!isTrueFalseOptions(question.options)) {
                          applyTrueFalse(questionIndex);
                        }
                      }}
                      className={cn(
                        "rounded-full px-2.5 py-1.5 font-body text-[0.55rem] font-bold uppercase tracking-[0.1em] transition-colors",
                        isTrueFalseOptions(question.options)
                          ? "bg-strawberry text-white"
                          : "text-ink-soft hover:bg-blush hover:text-strawberry",
                      )}
                    >
                      True / False
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = question.answer === option.id;
                    return (
                      <div
                        key={option.id}
                        className="flex items-center gap-1.5 rounded-xl border-2 border-ink/5 bg-white/70 p-2 sm:gap-2.5"
                      >
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={isCorrect}
                          onChange={() =>
                            updateQuestion(questionIndex, { answer: option.id })
                          }
                          aria-label={`Mark option ${optionIndex + 1} as correct`}
                          className="h-4 w-4 shrink-0 accent-[#F15B72]"
                        />
                        <TextInput
                          value={option.text}
                          onChange={(event) =>
                            updateOption(
                              questionIndex,
                              optionIndex,
                              event.target.value,
                            )
                          }
                          maxLength={200}
                          aria-label={`Option ${optionIndex + 1}`}
                          className="min-w-0"
                        />
                        {isCorrect ? (
                          <span className="shrink-0 rounded-full bg-mint-soft px-2 py-1 font-body text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#3d8a6d]">
                            correct
                          </span>
                        ) : null}
                        <div className="flex shrink-0 flex-col">
                          <button
                            type="button"
                            onClick={() =>
                              moveOption(questionIndex, optionIndex, -1)
                            }
                            disabled={optionIndex === 0}
                            aria-label={`Move option ${optionIndex + 1} up`}
                            title="Move up"
                            className="grid h-4 w-5 place-items-center rounded text-ink-soft/40 transition-colors hover:text-strawberry disabled:cursor-not-allowed disabled:opacity-20"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              moveOption(questionIndex, optionIndex, 1)
                            }
                            disabled={optionIndex === question.options.length - 1}
                            aria-label={`Move option ${optionIndex + 1} down`}
                            title="Move down"
                            className="grid h-4 w-5 place-items-center rounded text-ink-soft/40 transition-colors hover:text-strawberry disabled:cursor-not-allowed disabled:opacity-20"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                        <RemoveButton
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          disabled={question.options.length <= 2}
                          label={`Remove option ${optionIndex + 1}`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <AddButton onClick={() => addOption(questionIndex)}>
                    Add choice
                  </AddButton>
                  <span className="font-hand text-base text-ink-soft/55">
                    {question.options.length} choices · minimum 2
                  </span>
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="If they get it right"
                  hint="Make them feel clever."
                  required
                >
                  <TextArea
                    rows={3}
                    value={question.correctReaction}
                    onChange={(event) =>
                      updateQuestion(questionIndex, {
                        correctReaction: event.target.value,
                      })
                    }
                    maxLength={500}
                  />
                </Field>
                <Field
                  label="If they get it wrong"
                  hint="Funny beats competitive."
                  required
                >
                  <TextArea
                    rows={3}
                    value={question.wrongReaction}
                    onChange={(event) =>
                      updateQuestion(questionIndex, {
                        wrongReaction: event.target.value,
                      })
                    }
                    maxLength={500}
                  />
                </Field>
              </div>
            </CollapsibleCard>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <AddButton
            onClick={addQuestion}
            disabled={content.quiz.length >= 10}
          >
            Add a question
          </AddButton>
          <span className="font-hand text-base text-ink-soft/55">
            {content.quiz.length} / 10
          </span>
        </div>
      </EditorCard>
    </div>
  );
}
