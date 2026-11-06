export const letterSections = [
  {
    id: "chapter",
    label: "The last chapter",
    subtitle: "The sealed-letter intro.",
    tip: "Set the scene before they open the envelope. Keep it warm and a little mysterious.",
  },
  {
    id: "letter",
    label: "The letter itself",
    subtitle: "The handwritten note.",
    tip: "This is the part they will reread. Use the small, specific details.",
  },
  {
    id: "question",
    label: "The question",
    subtitle: "The big ask and playful buttons.",
    tip: "Keep the question clear and the second button playful.",
  },
  {
    id: "celebration",
    label: "After they say yes",
    subtitle: "The celebration screen.",
    tip: "This is the screen they will screenshot. Make it feel like them.",
  },
] as const;

export type LetterSectionId = (typeof letterSections)[number]["id"];

export function getLetterSection(id: LetterSectionId) {
  return letterSections.find((section) => section.id === id) ?? letterSections[0];
}
