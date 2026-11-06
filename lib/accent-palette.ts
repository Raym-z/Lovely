import type { Accent } from "@/content/lovely";

export type AccentPaletteEntry = {
  value: Accent;
  label: string;
  description: string;
  swatch: string;
  sticker: string;
  accentTone: string;
  soft: string;
  couponButton: string;
};

export const accentPalette: AccentPaletteEntry[] = [
  {
    value: "pink",
    label: "Strawberry pink",
    description: "Soft blush with a sweet red edge.",
    swatch: "bg-pink",
    sticker: "border-pink-soft bg-blush text-strawberry-deep",
    accentTone: "bg-blush text-strawberry-deep",
    soft: "bg-pink-soft text-strawberry-deep",
    couponButton:
      "border-strawberry/30 text-strawberry-deep hover:bg-pink-soft",
  },
  {
    value: "lavender",
    label: "Lavender",
    description: "Dreamy lilac and quiet violet.",
    swatch: "bg-lavender",
    sticker: "border-lavender bg-lavender-soft text-[#7b60b5]",
    accentTone: "bg-lavender-soft text-[#7b60b5]",
    soft: "bg-lavender-soft text-[#7b60b5]",
    couponButton:
      "border-[#c7b4f4]/60 text-[#7b60b5] hover:bg-lavender-soft",
  },
  {
    value: "butter",
    label: "Butter yellow",
    description: "Warm sunshine and a little glow.",
    swatch: "bg-butter",
    sticker: "border-butter bg-butter-soft text-[#a5771c]",
    accentTone: "bg-butter-soft text-[#a5771c]",
    soft: "bg-butter-soft text-[#a5771c]",
    couponButton:
      "border-[#e7cf8c]/70 text-[#a5771c] hover:bg-butter-soft",
  },
  {
    value: "mint",
    label: "Soft mint",
    description: "Fresh green with a gentle calm.",
    swatch: "bg-mint",
    sticker: "border-mint bg-mint-soft text-[#3d8a6d]",
    accentTone: "bg-mint-soft text-[#3d8a6d]",
    soft: "bg-mint-soft text-[#3d8a6d]",
    couponButton:
      "border-[#a9ddc9]/70 text-[#3d8a6d] hover:bg-mint-soft",
  },
  {
    value: "peach",
    label: "Peach sorbet",
    description: "A soft, warm peach with a playful feel.",
    swatch: "bg-[#FFD6C2]",
    sticker: "border-[#FFD6C2] bg-[#FFE9DE] text-[#A65A3C]",
    accentTone: "bg-[#FFE9DE] text-[#A65A3C]",
    soft: "bg-[#FFE9DE] text-[#A65A3C]",
    couponButton: "border-[#F2B79B]/70 text-[#A65A3C] hover:bg-[#FFE9DE]",
  },
  {
    value: "baby-blue",
    label: "Baby blue",
    description: "A gentle sky blue, calm and refreshing.",
    swatch: "bg-[#C9E4FF]",
    sticker: "border-[#C9E4FF] bg-[#E3F1FF] text-[#3D6E99]",
    accentTone: "bg-[#E3F1FF] text-[#3D6E99]",
    soft: "bg-[#E3F1FF] text-[#3D6E99]",
    couponButton: "border-[#A9CFF0]/70 text-[#3D6E99] hover:bg-[#E3F1FF]",
  },
  {
    value: "dusty-rose",
    label: "Dusty rose",
    description: "A muted romantic pink with a vintage feel.",
    swatch: "bg-[#E9B8C3]",
    sticker: "border-[#E9B8C3] bg-[#F7E4E8] text-[#9C4F60]",
    accentTone: "bg-[#F7E4E8] text-[#9C4F60]",
    soft: "bg-[#F7E4E8] text-[#9C4F60]",
    couponButton: "border-[#E2AEB9]/70 text-[#9C4F60] hover:bg-[#F7E4E8]",
  },
  {
    value: "periwinkle",
    label: "Periwinkle",
    description: "A dreamy blend of soft blue and violet.",
    swatch: "bg-[#C9C5FF]",
    sticker: "border-[#C9C5FF] bg-[#E9E7FF] text-[#5B54B3]",
    accentTone: "bg-[#E9E7FF] text-[#5B54B3]",
    soft: "bg-[#E9E7FF] text-[#5B54B3]",
    couponButton: "border-[#B7B1F5]/70 text-[#5B54B3] hover:bg-[#E9E7FF]",
  },
  {
    value: "sage",
    label: "Sage green",
    description: "A muted natural green, soft and elegant.",
    swatch: "bg-[#C5DCC8]",
    sticker: "border-[#C5DCC8] bg-[#E5F0E7] text-[#4A7353]",
    accentTone: "bg-[#E5F0E7] text-[#4A7353]",
    soft: "bg-[#E5F0E7] text-[#4A7353]",
    couponButton: "border-[#B0CDB5]/70 text-[#4A7353] hover:bg-[#E5F0E7]",
  },
  {
    value: "cream",
    label: "Cream",
    description: "A warm, delicate ivory with a cozy feel.",
    swatch: "bg-[#F3E5C8]",
    sticker: "border-[#F3E5C8] bg-[#FBF3E2] text-[#8A6E3A]",
    accentTone: "bg-[#FBF3E2] text-[#8A6E3A]",
    soft: "bg-[#FBF3E2] text-[#8A6E3A]",
    couponButton: "border-[#E5D3AC]/70 text-[#8A6E3A] hover:bg-[#FBF3E2]",
  },
  {
    value: "coral",
    label: "Coral",
    description: "A cheerful soft coral with a little more personality.",
    swatch: "bg-[#FFAAA5]",
    sticker: "border-[#FFAAA5] bg-[#FFE2DF] text-[#B2473F]",
    accentTone: "bg-[#FFE2DF] text-[#B2473F]",
    soft: "bg-[#FFE2DF] text-[#B2473F]",
    couponButton: "border-[#F3A29D]/70 text-[#B2473F] hover:bg-[#FFE2DF]",
  },
  {
    value: "powder-blue",
    label: "Powder blue",
    description: "A slightly muted blue with a delicate appearance.",
    swatch: "bg-[#BFD8E8]",
    sticker: "border-[#BFD8E8] bg-[#E3EFF5] text-[#4C7187]",
    accentTone: "bg-[#E3EFF5] text-[#4C7187]",
    soft: "bg-[#E3EFF5] text-[#4C7187]",
    couponButton: "border-[#A9C8DB]/70 text-[#4C7187] hover:bg-[#E3EFF5]",
  },
];

export const accentPaletteMap = Object.fromEntries(
  accentPalette.map((entry) => [entry.value, entry]),
) as Record<Accent, AccentPaletteEntry>;

export const accentOptions = accentPalette.map(
  ({ value, label, description, swatch }) => ({
    value,
    label,
    description,
    swatch,
  }),
);
