"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  FinalLetter as FinalLetterCopy,
  LovelyContent,
} from "@/content/lovely";
import {
  CollapsibleCard,
  EditorCard,
  Field,
  StringListEditor,
  TextArea,
  TextInput,
} from "../fields";
import {
  letterSections,
  type LetterSectionId,
} from "../letter-sections";

export function LetterStep({
  content,
  setContent,
  signatureNameError,
  openSectionId,
  onOpenSectionChange,
}: {
  content: LovelyContent;
  setContent: Dispatch<SetStateAction<LovelyContent>>;
  signatureNameError?: string | null;
  openSectionId: LetterSectionId | null;
  onOpenSectionChange: (id: LetterSectionId | null) => void;
}) {
  function updateLetter(patch: Partial<FinalLetterCopy>) {
    setContent((previous) => ({
      ...previous,
      finalLetter: { ...previous.finalLetter, ...patch },
    }));
  }

  function updateCelebration(
    patch: Partial<FinalLetterCopy["celebration"]>,
  ) {
    setContent((previous) => ({
      ...previous,
      finalLetter: {
        ...previous.finalLetter,
        celebration: { ...previous.finalLetter.celebration, ...patch },
      },
    }));
  }

  return (
    <div className="space-y-5">
      <EditorCard
        title="The final letter"
        description="Four little parts make up the ending. Open a section to edit it — the preview follows the active part."
        accent="lavender"
      >
        <div className="space-y-3">
          {letterSections.map((section, index) => (
            <CollapsibleCard
              key={section.id}
              title={section.label}
              subtitle={section.subtitle}
              badge={`part ${index + 1}`}
              open={openSectionId === section.id}
              onOpenChange={(open) =>
                onOpenSectionChange(open ? section.id : null)
              }
            >
              {section.id === "chapter" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Eyebrow" required>
                      <TextInput
                        value={content.finalLetter.eyebrow}
                        onChange={(event) =>
                          updateLetter({ eyebrow: event.target.value })
                        }
                        maxLength={80}
                      />
                    </Field>
                    <Field label="Tap hint" required>
                      <TextInput
                        value={content.finalLetter.tapHint}
                        onChange={(event) =>
                          updateLetter({ tapHint: event.target.value })
                        }
                        maxLength={200}
                      />
                    </Field>
                  </div>
                  <Field label="Big title" required>
                    <TextArea
                      rows={2}
                      value={content.finalLetter.title}
                      onChange={(event) =>
                        updateLetter({ title: event.target.value })
                      }
                      maxLength={200}
                    />
                  </Field>
                  <Field label="Subtitle" required>
                    <TextArea
                      rows={2}
                      value={content.finalLetter.subtitle}
                      onChange={(event) =>
                        updateLetter({ subtitle: event.target.value })
                      }
                      maxLength={500}
                    />
                  </Field>
                </>
              ) : null}

              {section.id === "letter" ? (
                <>
                  <Field label="Salutation" required>
                    <TextInput
                      value={content.finalLetter.salutation}
                      onChange={(event) =>
                        updateLetter({ salutation: event.target.value })
                      }
                      maxLength={200}
                    />
                  </Field>
                  <div>
                    <p className="mb-2 font-body text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-soft/75">
                      Letter paragraphs
                    </p>
                    <StringListEditor
                      items={content.finalLetter.paragraphs}
                      onChange={(paragraphs) =>
                        updateLetter({ paragraphs })
                      }
                      placeholder="A paragraph of the letter..."
                      addLabel="Add a paragraph"
                      min={1}
                      max={12}
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Sign-off" required>
                      <TextInput
                        value={content.finalLetter.signature}
                        onChange={(event) =>
                          updateLetter({ signature: event.target.value })
                        }
                        maxLength={200}
                      />
                    </Field>
                    <div>
                      <Field label="Signature name" required>
                        <TextInput
                          id="letter-signature-name"
                          value={content.finalLetter.signatureName}
                          onChange={(event) =>
                            updateLetter({
                              signatureName: event.target.value,
                            })
                          }
                          maxLength={80}
                          aria-invalid={Boolean(signatureNameError)}
                          aria-describedby={
                            signatureNameError
                              ? "letter-signature-name-error"
                              : undefined
                          }
                        />
                      </Field>
                      {signatureNameError ? (
                        <p
                          id="letter-signature-name-error"
                          role="alert"
                          className="mt-1.5 font-body text-xs font-semibold text-strawberry"
                        >
                          {signatureNameError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Field label="P.S." required>
                    <TextArea
                      rows={2}
                      value={content.finalLetter.postscript}
                      onChange={(event) =>
                        updateLetter({ postscript: event.target.value })
                      }
                      maxLength={500}
                    />
                  </Field>
                </>
              ) : null}

              {section.id === "question" ? (
                <>
                  <Field label="The question" required>
                    <TextInput
                      value={content.finalLetter.question}
                      onChange={(event) =>
                        updateLetter({ question: event.target.value })
                      }
                      maxLength={200}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Yes button" required>
                      <TextInput
                        value={content.finalLetter.yesLabel}
                        onChange={(event) =>
                          updateLetter({ yesLabel: event.target.value })
                        }
                        maxLength={80}
                      />
                    </Field>
                    <Field label="Thinking button" required>
                      <TextInput
                        value={content.finalLetter.thinkLabel}
                        onChange={(event) =>
                          updateLetter({ thinkLabel: event.target.value })
                        }
                        maxLength={80}
                      />
                    </Field>
                  </div>
                  <div>
                    <p className="mb-2 font-body text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-soft/75">
                      Little notes when they press &ldquo;think&rdquo;
                    </p>
                    <StringListEditor
                      items={content.finalLetter.thinkingNotes}
                      onChange={(thinkingNotes) =>
                        updateLetter({ thinkingNotes })
                      }
                      placeholder="A gentle, playful note..."
                      addLabel="Add a note"
                      min={1}
                      max={6}
                      rows={2}
                    />
                  </div>
                  <Field
                    label="Final thinking button label"
                    hint="After the notes run out, this button becomes a second yes."
                    required
                  >
                    <TextInput
                      value={content.finalLetter.acceptAfterThinkingLabel}
                      onChange={(event) =>
                        updateLetter({
                          acceptAfterThinkingLabel: event.target.value,
                        })
                      }
                      maxLength={120}
                    />
                  </Field>
                </>
              ) : null}

              {section.id === "celebration" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Flag" required>
                      <TextInput
                        value={content.finalLetter.celebration.flag}
                        onChange={(event) =>
                          updateCelebration({ flag: event.target.value })
                        }
                        maxLength={80}
                      />
                    </Field>
                    <Field label="Celebration title" required>
                      <TextInput
                        value={content.finalLetter.celebration.title}
                        onChange={(event) =>
                          updateCelebration({ title: event.target.value })
                        }
                        maxLength={200}
                      />
                    </Field>
                  </div>
                  <Field label="Celebration subtitle" required>
                    <TextArea
                      rows={2}
                      value={content.finalLetter.celebration.subtitle}
                      onChange={(event) =>
                        updateCelebration({
                          subtitle: event.target.value,
                        })
                      }
                      maxLength={300}
                    />
                  </Field>
                  <Field label="Closing note" required>
                    <TextArea
                      rows={2}
                      value={content.finalLetter.celebration.note}
                      onChange={(event) =>
                        updateCelebration({ note: event.target.value })
                      }
                      maxLength={500}
                    />
                  </Field>
                </>
              ) : null}
            </CollapsibleCard>
          ))}
        </div>
      </EditorCard>
    </div>
  );
}
