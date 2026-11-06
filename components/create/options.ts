import type { Accent, PhotoVariant } from "@/content/lovely";

export const photoOptions: Array<{ value: PhotoVariant; label: string }> = [
  { value: "cafe", label: "Coffee shop" },
  { value: "sunset", label: "Sunset" },
  { value: "rain", label: "Rainy window" },
  { value: "roadtrip", label: "Road trip" },
  { value: "cozy", label: "Cozy night" },
  { value: "dance", label: "Kitchen dance" },
];

export const accentOptions: Array<{ value: Accent; label: string }> = [
  { value: "pink", label: "Strawberry pink" },
  { value: "lavender", label: "Lavender" },
  { value: "butter", label: "Butter yellow" },
  { value: "mint", label: "Soft mint" },
];
