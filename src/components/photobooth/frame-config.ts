
export const FRAME_WIDTH = 887;
export const FRAME_HEIGHT = 1774;

export type PhotoSlot = readonly [
  x: number,
  y: number,
  width: number,
  height: number
];

export type PhotoFrame = {
  id: string;
  name: string;
  src: string;
  slots: readonly [
    PhotoSlot,
    PhotoSlot,
    PhotoSlot,
    PhotoSlot
  ];
};

const ROOT = "/images/photobooth/frames";

export const FRAMES: readonly PhotoFrame[] = [
  {
    id: "pink-ribbon",
    name: "Pink Ribbon",
    src: `${ROOT}/pink-ribbon.png`,
    slots: [
      [194, 207, 493, 309],
      [194, 553, 493, 281],
      [194, 872, 493, 279],
      [194, 1189, 493, 281],
    ],
  },
  {
    id: "vintage-love",
    name: "Vintage Love",
    src: `${ROOT}/vintage-love.png`,
    slots: [
      [190, 198, 503, 292],
      [190, 529, 503, 284],
      [190, 851, 503, 286],
      [190, 1178, 503, 276],
    ],
  },
  {
    id: "sakura-memories",
    name: "Sakura Memories",
    src: `${ROOT}/sakura-memories.png`,
    slots: [
      [184, 180, 487, 287],
      [184, 512, 487, 287],
      [184, 846, 487, 282],
      [184, 1175, 487, 278],
    ],
  },
  {
    id: "birthday-girl",
    name: "Birthday Girl",
    src: `${ROOT}/birthday-girl.png`,
    slots: [
      [177, 204, 515, 292],
      [177, 540, 515, 286],
      [177, 870, 515, 288],
      [177, 1202, 515, 277],
    ],
  },
];
