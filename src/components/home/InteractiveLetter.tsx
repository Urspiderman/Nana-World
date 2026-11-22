
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Heart,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import "../../app/(protected)/interactive-letter.css";

/* =========================================
   TEMPORARY LOVE LETTER
========================================= */

const letterParagraphs = [
  "In a world full of unexpected moments, finding you has been my favorite surprise.",

  "You make the ordinary days feel a little more magical. Even the smallest things — a conversation, a laugh, or a simple moment together — become memories I want to keep forever.",

  "I hope you always remember how special you are, not just because of the happiness you bring into my life, but simply because you are you.",

  "And if I could choose a thousand different stories, in a thousand different worlds, I would still hope to find you in every single one. And anyways, Happy Birthday.",
];

/* =========================================
   BACKGROUND ORNAMENTS
========================================= */

const ornaments = Array.from({ length: 35 }, (_, i) => ({
  symbol: ["♡", "✧", "✿", "❀", "✦"][i % 5],
  left: `${(i * 37 + 9) % 96}%`,
  top: `${(i * 23 + 7) % 94}%`,
  delay: `${-(i % 7)}s`,
  duration: `${5 + (i % 5)}s`,
}));

type LetterPhase =
  | "closed"
  | "opening"
  | "open"
  | "closing";

/* =========================================
   COMPONENT
========================================= */

export default function InteractiveLetter() {
  const [phase, setPhase] =
    useState<LetterPhase>("closed");

  const timerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const openLetter = () => {
    if (phase !== "closed") return;

    setPhase("opening");

    timerRef.current = setTimeout(() => {
      setPhase("open");
    }, 1500);
  };

  const closeLetter = () => {
    if (phase !== "open") return;

    setPhase("closing");

    timerRef.current = setTimeout(() => {
      setPhase("closed");
    }, 950);
  };

  const showPaper =
    phase === "open" || phase === "closing";

  return (
    <section className="sw-letter" id="letter">

      {/* BACKGROUND ORNAMENTS */}
      <div
        className="sw-letter-ornaments"
        aria-hidden="true"
      >
        {ornaments.map((item, index) => (
          <span
            key={index}
            style={{
              left: item.left,
              top: item.top,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          >
            {item.symbol}
          </span>
        ))}
      </div>

      {/* SECTION HEADER */}
      <div className="sw-letter-header">
        <div className="sw-letter-eyebrow">
          <Sparkles size={15} />
          <span>WORDS FROM MY HEART</span>
          <Sparkles size={15} />
        </div>

        <h2>A Letter for You</h2>

        <p>
          Some feelings are too special to leave unspoken.
          This little letter is just for you.
        </p>
      </div>

      {/* INTERACTIVE LETTER SCENE */}
      <div
        className={`sw-letter-scene is-${phase}`}
      >

        {/* ENVELOPE */}
        <div className="sw-letter-envelope-wrap">

          <div className="sw-letter-envelope">

            {/* BACK */}
            <div className="sw-letter-envelope-back" />

            {/* INSIDE */}
            <div className="sw-letter-envelope-inside">
              <Heart
                size={30}
                fill="currentColor"
              />
            </div>

            {/* FLAP */}
            <div className="sw-letter-envelope-flap" />

            {/* PAPER INSIDE ENVELOPE */}
            <div className="sw-letter-envelope-sheet">
              <span>My Dearest Nana,</span>

              <Heart
                size={20}
                fill="currentColor"
              />
            </div>

            {/* FRONT POCKET */}
            <div className="sw-letter-envelope-front" />

            {/* CLICKABLE HEART SEAL */}
            <button
              type="button"
              className="sw-letter-envelope-seal"
              onClick={openLetter}
              disabled={phase !== "closed"}
              aria-label="Open your love letter"
              title="Open your love letter"
            >
              <Heart
                size={25}
                fill="currentColor"
              />
            </button>
          </div>

          {/* SMALL HINT */}
          {phase === "closed" && (
            <p className="sw-letter-hint">
              Tap the little heart to open ♡
            </p>
          )}

          {/* OPENING STATUS */}
          {phase === "opening" && (
            <p
              className="sw-letter-status"
              role="status"
            >
              Opening something special for you...
            </p>
          )}
        </div>

        {/* FULL LOVE LETTER */}
        {showPaper && (
          <article
            className={`sw-letter-paper ${
              phase === "closing"
                ? "is-closing"
                : ""
            }`}
          >
            {/* PAPER DECORATION */}
            <div className="sw-letter-paper-decoration">
              <Heart
                size={15}
                fill="currentColor"
              />

              <span>JUST FOR YOU</span>

              <Heart
                size={15}
                fill="currentColor"
              />
            </div>

            {/* GREETING */}
            <h3>My Dearest Nana,</h3>

            {/* LETTER CONTENT */}
            <div className="sw-letter-body">
              {letterParagraphs.map(
                (paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                )
              )}
            </div>

            {/* SIGNATURE */}
            <div className="sw-letter-signature">
              <span>With all my love,</span>

              <strong>
                Someone who adores you ♡
              </strong>
            </div>

            {/* FOOTER */}
            <div className="sw-letter-paper-bottom">
              Made with love, always.
            </div>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              className="sw-letter-reset-button"
              onClick={closeLetter}
              disabled={phase === "closing"}
            >
              <RotateCcw size={16} />
              Close the Letter
            </button>
          </article>
        )}
      </div>
    </section>
  );
}
