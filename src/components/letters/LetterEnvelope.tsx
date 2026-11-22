
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import type { LoveLetter } from "@/data/letters";
import type { BookPosition } from "./LetterCard";

type Props = {
  letter: LoveLetter;
  position: BookPosition;
  onClose: () => void;
};

type Phase = "starting" | "flying" | "reading";

export default function LetterEnvelope({
  letter,
  position,
  onClose,
}: Props) {
  const [phase, setPhase] = useState<Phase>("starting");
  const [pageIndex, setPageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const flyTimer = window.setTimeout(
      () => setPhase("flying"),
      reducedMotion ? 0 : 50
    );

    const readTimer = window.setTimeout(
      () => setPhase("reading"),
      reducedMotion ? 0 : 1050
    );

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const buttons = Array.from(
        dialogRef.current.querySelectorAll<HTMLButtonElement>(
          "button:not(:disabled)"
        )
      );

      if (!buttons.length) return;

      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(flyTimer);
      window.clearTimeout(readTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted]);

  const initialCenterX =
    position.x + position.width / 2;

  const initialCenterY =
    position.y + position.height / 2;

  const readerStyle = {
    "--reader-color": letter.color,
    "--reader-ink": letter.ink,
    "--origin-x": `${initialCenterX}px`,
    "--origin-y": `${initialCenterY}px`,
    "--origin-width": `${position.width}px`,
    "--origin-height": `${position.height}px`,
  } as CSSProperties;

  if (!mounted) return null;

  const isReading = phase === "reading";

  return createPortal(
    <div
      className="ll-reader-overlay"
      style={readerStyle}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="ll-reader-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ll-reader-title"
      >
        <button
          ref={closeRef}
          type="button"
          className="ll-reader-close"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
          Close
        </button>

        <div className="ll-reader-stage">
          {!isReading ? (
            <div
              className={`ll-flying-book ${
                phase === "flying" ? "is-flying" : ""
              }`}
            >
              <div className="ll-flying-book-body">
                <div className="ll-flying-pages" />

                <div className="ll-flying-spine">
                  <span>{letter.title}</span>
                </div>

                <div className="ll-flying-cover">
                  <div className="ll-flying-cover-frame">
                    <span className="ll-flying-symbol">
                      {letter.symbol}
                    </span>

                    <h2>{letter.title}</h2>

                    <span className="ll-flying-flourish">
                      ❦
                    </span>

                    <span className="ll-flying-brand">
                      NANA WORLD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="ll-reading-book">
              <div className="ll-reading-left">
                <div className="ll-paper-border">
                  <span className="ll-paper-ornament">
                    ❦
                  </span>

                  <span className="ll-paper-eyebrow">
                    FROM THE LIBRARY OF
                  </span>

                  <h2>{letter.title}</h2>

                  <span className="ll-paper-heart">
                    ♡
                  </span>

                  <span className="ll-paper-signature">
                    NANA WORLD
                  </span>
                </div>
              </div>

              <div
                key={`${letter.id}-${pageIndex}`}
                className="ll-reading-right"
              >
                <div className="ll-paper-border ll-paper-content-border">
                  <span className="ll-paper-top">
                    ✧ ♡ ✧
                  </span>

                  <div className="ll-paper-content">
                    {letter.pages[pageIndex]}
                  </div>

                  <span className="ll-paper-page-number">
                    {pageIndex + 1} / {letter.pages.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ll-reader-details">
          <span className="ll-reader-kicker">
            A LITTLE LETTER FOR YOU
          </span>

          <h2 id="ll-reader-title">
            {letter.title}
          </h2>

          <p>{letter.subtitle}</p>

          <div className="ll-reader-flourish">
            ✧ ♡ ✧
          </div>

          <div className="ll-reader-controls">
            <button
              type="button"
              disabled={!isReading || pageIndex === 0}
              onClick={() =>
                setPageIndex((value) =>
                  Math.max(0, value - 1)
                )
              }
            >
              ← Previous
            </button>

            <button
              type="button"
              disabled={
                !isReading ||
                pageIndex === letter.pages.length - 1
              }
              onClick={() =>
                setPageIndex((value) =>
                  Math.min(
                    letter.pages.length - 1,
                    value + 1
                  )
                )
              }
            >
              Next Page →
            </button>
          </div>

          <span className="ll-reader-hint">
            PRESS ESC TO CLOSE
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
