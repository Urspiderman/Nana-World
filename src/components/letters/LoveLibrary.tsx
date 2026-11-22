
"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";

import LetterCard from "./LetterCard";
import type { BookPosition } from "./LetterCard";
import LetterEnvelope from "./LetterEnvelope";

import {
  letters,
  type LoveLetter,
} from "@/data/letters";

const symbols = ["♡", "✿", "✧", "✦"];

function random(seed: number) {
  const value =
    Math.sin(seed * 127.1 + 78.233) * 43758.5453;

  return value - Math.floor(value);
}

const sparkles = Array.from(
  { length: 55 },
  (_, index) => {
    const seed = index + 1;

    return {
      id: seed,
      symbol: symbols[index % symbols.length],
      x: 2 + random(seed * 2) * 96,
      y: 3 + random(seed * 3) * 94,
      size: 9 + random(seed * 5) * 19,
      delay: -random(seed * 7) * 8,
      duration: 3 + random(seed * 11) * 5,
    };
  }
);

type Selection = {
  letter: LoveLetter;
  position: BookPosition;
};

export default function LoveLibrary() {
  const [selected, setSelected] =
    useState<Selection | null>(null);

  const triggerRef = useRef<HTMLElement | null>(null);

  function openLetter(
    letter: LoveLetter,
    position: BookPosition
  ) {
    triggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    setSelected({ letter, position });
  }

  const closeLetter = useCallback(() => {
    setSelected(null);

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  return (
    <main className="ll-page">
      <div className="ll-background" aria-hidden="true" />

      <div className="ll-sparkles" aria-hidden="true">
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className="ll-sparkle"
            style={
              {
                "--sx": `${sparkle.x}%`,
                "--sy": `${sparkle.y}%`,
                "--ss": `${sparkle.size}px`,
                "--sd": `${sparkle.delay}s`,
                "--st": `${sparkle.duration}s`,
              } as CSSProperties
            }
          >
            {sparkle.symbol}
          </span>
        ))}
      </div>

      <header className="ll-heading">
        <div className="ll-brand">
          Nana World ♡
        </div>

        <div className="ll-heading-ornament">
          ✿ ♡ ✿
        </div>

        <h1>
          Letters For You <span>♡</span>
        </h1>

        <p>
          Some feelings are better written than spoken.
        </p>

        <div className="ll-heading-divider">
          <span />
          ♡
          <span />
        </div>
      </header>

      <section
        className="ll-collection"
        aria-label="Love letter collection"
      >
        <div className="ll-book-row">
          {letters.map((letter, index) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              index={index}
              onOpen={openLetter}
            />
          ))}
        </div>

      </section>

      {selected && (
        <LetterEnvelope
          letter={selected.letter}
          position={selected.position}
          onClose={closeLetter}
        />
      )}
    </main>
  );
}
