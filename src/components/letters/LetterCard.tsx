
"use client";

import type { CSSProperties, MouseEvent } from "react";
import type { LoveLetter } from "@/data/letters";

export type BookPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  letter: LoveLetter;
  index: number;
  onOpen: (
    letter: LoveLetter,
    position: BookPosition
  ) => void;
};

const BOOKS = [
  { height: 335, depth: 82, tilt: -0.6 },
  { height: 354, depth: 88, tilt: 0.2 },
  { height: 326, depth: 78, tilt: -0.2 },
  { height: 346, depth: 86, tilt: 0.4 },
  { height: 334, depth: 80, tilt: -0.3 },
  { height: 358, depth: 92, tilt: 0.6 },
];

export default function LetterCard({
  letter,
  index,
  onOpen,
}: Props) {
  const book = BOOKS[index % BOOKS.length];

  const style = {
    "--book-color": letter.color,
    "--book-ink": letter.ink,
    "--book-height": `${book.height}px`,
    "--book-depth": `${book.depth}px`,
    "--book-tilt": `${book.tilt}deg`,
    "--book-delay": `${index * 75}ms`,
  } as CSSProperties;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    onOpen(letter, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  return (
    <button
      type="button"
      className="ll-volume-button"
      style={style}
      onClick={handleClick}
      aria-label={`Read ${letter.title}`}
    >
      <span className="ll-volume-shadow" />

      <span className="ll-volume">
        <span className="ll-volume-back" />

        <span className="ll-volume-paper" />

        <span className="ll-volume-front">
          <span className="ll-volume-cover-frame">
            <span className="ll-volume-cover-symbol">
              {letter.symbol}
            </span>

            <span className="ll-volume-cover-title">
              {letter.coverTitle}
            </span>

            <span className="ll-volume-cover-flourish">
              ❦
            </span>

            <span className="ll-volume-cover-brand">
              NANA WORLD
            </span>
          </span>
        </span>

        <span className="ll-volume-spine">
          <span className="ll-spine-raised-band top" />
          <span className="ll-spine-raised-band bottom" />

          <span className="ll-volume-spine-ornament">
            ✦
          </span>

          <span className="ll-volume-spine-title">
            {letter.title}
          </span>

          <span className="ll-volume-spine-symbol">
            {letter.symbol}
          </span>

          <span className="ll-volume-spine-imprint">
            NANA
          </span>
        </span>
      </span>
    </button>
  );
}
