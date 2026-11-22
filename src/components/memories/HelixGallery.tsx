
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Memory = {
  id: number;
  src: string;
  title: string;
};

type Sparkle = {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

const photoSources = [
  "/images/memories/photo-01.webp",
  "/images/memories/photo-02.webp",
  "/images/memories/photo-03.webp",
  "/images/memories/photo-04.webp",
  "/images/memories/photo-05.webp",
  "/images/memories/photo-06.webp",
  "/images/memories/photo-07.webp",
  "/images/memories/photo-08.webp",
  "/images/memories/photo-09.webp",
  "/images/memories/photo-10.webp",
  "/images/memories/photo-11.webp",
  "/images/memories/photo-12.webp",
  "/images/memories/photo-13.webp",
  "/images/memories/photo-14.webp",
  "/images/memories/photo-15.webp",
  "/images/memories/photo-16.webp",
  "/images/memories/photo-17.webp",
  "/images/memories/photo-18.webp",
  "/images/memories/photo-19.webp",
  "/images/memories/photo-20.webp",
  "/images/memories/photo-21.webp",  
];

const memories: Memory[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: index + 1,
    src: photoSources[index % photoSources.length],
    title: `Our Memory ${index + 1}`,
  })
);

const SPACING = 145;
const LENGTH = memories.length * SPACING;

const sparkleSymbols = ["♡", "✿", "✧", "✦"];

// Deterministic random agar tidak terjadi
// hydration mismatch di Next.js.
function seededRandom(seed: number) {
  const value = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const sparkles: Sparkle[] = Array.from(
  { length: 65 },
  (_, index) => {
    const seed = index + 1;

    return {
      id: seed,
      symbol: sparkleSymbols[index % sparkleSymbols.length],
      x: 2 + seededRandom(seed * 2) * 96,
      y: 3 + seededRandom(seed * 3) * 94,
      size: 10 + seededRandom(seed * 5) * 21,
      duration: 3 + seededRandom(seed * 7) * 5,
      delay: -seededRandom(seed * 11) * 8,
      opacity: 0.3 + seededRandom(seed * 13) * 0.6,
    };
  }
);

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

export default function HelixGallery() {
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const offsetRef = useRef(0);
  const selectedRef = useRef(false);

  const [selected, setSelected] = useState<Memory | null>(null);

  useEffect(() => {
    selectedRef.current = selected !== null;
  }, [selected]);

  useEffect(() => {
    let frame = 0;
    let previous = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const animate = (time: number) => {
      const delta = previous
        ? Math.min((time - previous) / 16.67, 3)
        : 1;

      previous = time;

      if (!reducedMotion.matches && !selectedRef.current) {
        offsetRef.current = wrap(
          offsetRef.current + 0.48 * delta,
          LENGTH
        );
      }

      const mobile = window.innerWidth < 700;

      const visibleRange = mobile ? 1200 : 2300;
      const radiusY = mobile ? 105 : 185;
      const radiusZ = mobile ? 180 : 360;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const raw = index * SPACING - offsetRef.current;

        const x =
          wrap(raw + LENGTH / 2, LENGTH) -
          LENGTH / 2;

        const angle = (x / SPACING) * 0.52;

        const y = Math.sin(angle) * radiusY;
        const z = Math.cos(angle) * radiusZ;

        const depth =
          (z + radiusZ) / (radiusZ * 2);

        const scale = 0.58 + depth * 0.56;
        const rotateY = Math.sin(angle) * -24;

        const edge = Math.max(
          0,
          1 - Math.abs(x) / visibleRange
        );

        const opacity =
          Math.min(1, edge * 2.8) *
          (0.25 + depth * 0.75);

        card.style.transform = `
          translate3d(
            calc(-50% + ${x}px),
            calc(-50% + ${y}px),
            ${z}px
          )
          rotateY(${rotateY}deg)
          scale(${scale})
        `;

        card.style.opacity = String(opacity);

        card.style.zIndex = String(
          Math.round(depth * 100)
        );

        card.style.filter = `brightness(${
          0.35 + depth * 0.65
        })`;

        card.style.pointerEvents =
          Math.abs(x) < visibleRange &&
          depth > 0.35
            ? "auto"
            : "none";
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  return (
    <main className="memory-page">
      {/* HEADER */}
      <header className="memory-nav">
        <div className="memory-logo">
          Nana World <span>♡</span>
        </div>

        <span className="memory-nav-label">
          UR LITTLE UNIVERSE
        </span>
      </header>

      {/* MAIN STAGE */}
      <section className="memory-stage">
        {/* BACKGROUND SPARKLES */}
        <div
          className="memory-sparkles"
          aria-hidden="true"
        >
          {sparkles.map((sparkle) => (
            <span
              key={sparkle.id}
              className="memory-sparkle"
              style={
                {
                  "--sparkle-x": `${sparkle.x}%`,
                  "--sparkle-y": `${sparkle.y}%`,
                  "--sparkle-size": `${sparkle.size}px`,
                  "--sparkle-duration": `${sparkle.duration}s`,
                  "--sparkle-delay": `${sparkle.delay}s`,
                  "--sparkle-opacity": sparkle.opacity,
                } as React.CSSProperties
              }
            >
              {sparkle.symbol}
            </span>
          ))}
        </div>

        {/* 3D HELIX */}
        <div
          className="memory-helix"
          aria-label="Moving gallery of our memories"
        >
          {memories.map((memory, index) => (
            <button
              key={memory.id}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              type="button"
              className="memory-helix-card"
              onClick={() => setSelected(memory)}
              aria-label={`Open ${memory.title}`}
            >
              <Image
                src={memory.src}
                alt={memory.title}
                fill
                sizes="(max-width: 700px) 140px, 220px"
                draggable={false}
              />
            </button>
          ))}
        </div>

        {/* CINEMATIC VIGNETTE */}
        <div
          className="memory-vignette"
          aria-hidden="true"
        />

        {/* HERO TEXT */}
        <div className="memory-copy">
          <span className="memory-eyebrow">
            ✦ THE STORY OF YOU ✦
          </span>

          <h1>
            Memory
            <br />
            <em>Lane ♡</em>
          </h1>

          <div className="memory-copy-divider">
            <span />
            ♡
            <span />
          </div>

          <p>
            Every moment
            <br />
            is worth remembering.
          </p>

          <span className="memory-instruction">
            ✧ Click a photo to relive a moment
          </span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="memory-footer">
        <span>♡ ENDLESS MEMORIES</span>
        <span>MADE WITH LOVE</span>
      </footer>

      {/* PHOTO MODAL */}
      {selected && (
        <div
          className="memory-modal-backdrop"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="memory-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="memory-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close memory"
            >
              ×
            </button>

            <div className="memory-modal-image">
              <Image
                src={selected.src}
                alt={selected.title}
                fill
                sizes="min(90vw, 480px)"
              />
            </div>

            <h2>{selected.title} ♡</h2>

            <p>
              A little moment, forever in my heart.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
