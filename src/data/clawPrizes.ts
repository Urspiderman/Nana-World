
export type ClawPrize = {
  id: string;
  name: string;
  model: string;
  preview: string;
  message: string;
};

export type PlushInstance = {
  id: string;
  prizeId: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  tilt: number;
  size: number;
};

export const clawPrizes: ClawPrize[] = [
  {
    id: "teddy_bear",
    name: "Teddy Bear",
    model: "/models/claw-machine/teddy_bear.glb",
    preview: "/images/claw-machine/prizes/teddy_bear.png",
    message: "A little teddy bear to hug whenever you miss me. ♡",
  },
  {
    id: "bunny",
    name: "Sweet Bunny",
    model: "/models/claw-machine/bunny.glb",
    preview: "/images/claw-machine/prizes/bunny.png",
    message: "Every moment with you feels magical. ♡",
  },
  {
    id: "kitty",
    name: "Little Kitty",
    model: "/models/claw-machine/kitty.glb",
    preview: "/images/claw-machine/prizes/kitty.png",
    message: "A tiny kitty with a very big hug. ♡",
  },
  {
    id: "strawberry",
    name: "Strawberry",
    model: "/models/claw-machine/strawberry.glb",
    preview: "/images/claw-machine/prizes/strawberry.png",
    message: "Life is sweeter with you in it. ♡",
  },
  {
    id: "heart_pillow",
    name: "Love Heart",
    model: "/models/claw-machine/heart_pillow.glb",
    preview: "/images/claw-machine/prizes/heart_pillow.png",
    message: "My heart has always been yours. ♡",
  },
  {
    id: "pink_ribbon",
    name: "Pink Ribbon",
    model: "/models/claw-machine/pink_ribbon.glb",
    preview: "/images/claw-machine/prizes/pink_ribbon.png",
    message: "You are my prettiest surprise. ♡",
  },
  {
    id: "flower",
    name: "Blooming Flower",
    model: "/models/claw-machine/flower.glb",
    preview: "/images/claw-machine/prizes/flower.png",
    message: "A flower for my favorite person. ♡",
  },
];

export const TOTAL_PRIZES = clawPrizes.length;

export const plushInstances: PlushInstance[] =
  Array.from({ length: 35 }, (_, index) => {
    const column = index % 7;
    const row = Math.floor(index / 7);

    return {
      id: `plush-${index}`,
      prizeId: clawPrizes[
        (column + row * 3) % TOTAL_PRIZES
      ].id,

      x:
        -1.35 +
        column * 0.45 +
        Math.sin(index * 2.7) * 0.045,

      y:
        1.55 +
        (row % 3) * 0.10,

      z:
        -0.78 +
        row * 0.38 +
        Math.cos(index * 1.8) * 0.035,

      rotation:
        Math.sin(index * 1.7) * 0.65,

      tilt:
        Math.sin(index * 2.3) * 0.16,

      // Boneka lebih besar
      size:
        0.55 +
        (index % 4) * 0.04,
    };
  });

export function getPrizeById(id: string) {
  return clawPrizes.find((prize) => prize.id === id);
}
