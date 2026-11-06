import type { PhotoVariant } from "@/content/lovely";

export { accentOptions } from "@/lib/accent-palette";

export const photoOptions: Array<{
  value: PhotoVariant;
  label: string;
  description: string;
}> = [
  {
    value: "cafe",
    label: "Coffee shop",
    description: "Warm cups, low light, nowhere else to be.",
  },
  {
    value: "sunset",
    label: "Sunset",
    description: "Golden hour and a sky that says it all.",
  },
  {
    value: "rain",
    label: "Rainy window",
    description: "One window, two cups, the world outside.",
  },
  {
    value: "roadtrip",
    label: "Road trip",
    description: "Windows down and a questionable playlist.",
  },
  {
    value: "cozy",
    label: "Cozy night",
    description: "Blankets, stars, and a very slow night.",
  },
  {
    value: "dance",
    label: "Kitchen dance",
    description: "Kitchen floor, no music needed.",
  },
  {
    value: "bookstore",
    label: "Bookstore date",
    description: "Wooden shelves and quiet, intimate corners.",
  },
  {
    value: "cherry-blossom",
    label: "Cherry blossom walk",
    description: "Petal paths and soft spring light.",
  },
  {
    value: "beach-picnic",
    label: "Beach picnic",
    description: "Pastel blankets, soft sand, golden sun.",
  },
  {
    value: "city-night",
    label: "City night walk",
    description: "Glowing storefronts and reflected lights.",
  },
  {
    value: "rooftop",
    label: "Starlit rooftop",
    description: "A quiet skyline under a sky full of stars.",
  },
  {
    value: "flower-market",
    label: "Flower market",
    description: "Bouquets, sunlight, and little details.",
  },
  {
    value: "autumn",
    label: "Autumn afternoon",
    description: "Golden leaves and a warm afternoon.",
  },
  {
    value: "arcade",
    label: "Arcade date",
    description: "Neon lights and happy nostalgia.",
  },
  {
    value: "mountain",
    label: "Mountain escape",
    description: "Misty hills and soft morning air.",
  },
  {
    value: "sunday-morning",
    label: "Sunday morning",
    description: "Sunlit breakfast and nowhere to rush.",
  },
];
