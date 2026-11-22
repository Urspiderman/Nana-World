
export const ASSET_ROOT = "/images/photobooth";

export const FRAMES = [
  {
    id: "pink-ribbon",
    name: "Pink Ribbon",
    image: `${ASSET_ROOT}/frames/pink-ribbon.png`,
    color: "#f6cbd9",
    accent: "#ad637e",
  },
  {
    id: "vintage-love",
    name: "Vintage Love",
    image: `${ASSET_ROOT}/frames/vintage-love.png`,
    color: "#f2e5d5",
    accent: "#a67d65",
  },
  {
    id: "sakura-memories",
    name: "Sakura Memories",
    image: `${ASSET_ROOT}/frames/sakura-memories.png`,
    color: "#f9dce8",
    accent: "#b87898",
  },
  {
    id: "birthday-girl",
    name: "Birthday Girl",
    image: `${ASSET_ROOT}/frames/birthday-girl.png`,
    color: "#e9d8f6",
    accent: "#a479ba",
  },
] as const;

export type FrameId = (typeof FRAMES)[number]["id"];

export const FILTERS = [
  { id: "original", name: "Original", css: "none" },
  {
    id: "soft-pink",
    name: "Soft Pink",
    css: "saturate(0.9) sepia(0.12) brightness(1.07)",
  },
  {
    id: "vintage",
    name: "Vintage",
    css: "sepia(0.38) contrast(0.9) saturate(0.85)",
  },
  {
    id: "bw",
    name: "B&W",
    css: "grayscale(1) contrast(1.08)",
  },
] as const;

export type FilterId = (typeof FILTERS)[number]["id"];

export const STICKERS = [
  {
    id: "none",
    name: "None",
    image: "",
  },
  {
    id: "ribbon",
    name: "Ribbon",
    image: `${ASSET_ROOT}/stickers/ribbon.png`,
  },
  {
    id: "heart",
    name: "Heart",
    image: `${ASSET_ROOT}/stickers/heart.png`,
  },
  {
    id: "flower",
    name: "Flower",
    image: `${ASSET_ROOT}/stickers/flower.png`,
  },
  {
    id: "birthday-cake",
    name: "Cake",
    image: `${ASSET_ROOT}/stickers/birthday-cake.png`,
  },
] as const;

export type StickerId = (typeof STICKERS)[number]["id"];
