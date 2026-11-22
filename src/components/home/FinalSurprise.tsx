
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Gift,
  Heart,
  Sparkles,
  RotateCcw,
  Camera,
} from "lucide-react";

import "../../app/(protected)/final-surprise.css";

type SurprisePhase = "closed" | "opening" | "revealed";

const memories = [
  {
    image: "/images/home/finale/memory-1.webp",
    caption: "Abis mandi wkwk♡",
    rotation: -10,
  },
  {
    image: "/images/home/finale/memory-2.webp",
    caption: "Cowo cute",
    rotation: 7,
  },
  {
    image: "/images/home/finale/memory-3.webp",
    caption: "Rambut badai",
    rotation: -4,
  },
  {
    image: "/images/home/finale/memory-4.webp",
    caption: "Dingin banget bang 🥶",
    rotation: 9,
  },
  {
    image: "/images/home/finale/memory-5.webp",
    caption: "Cowo berkacamata itu lagi",
    rotation: -7,
  },
];

const burstParticles = Array.from(
  { length: 30 },
  (_, i) => {
    const angle = (i / 30) * Math.PI * 2;

    return {
      id: i,
      symbol: ["♥", "♡", "✦", "✧", "✿"][i % 5],
      x: Math.cos(angle) * (110 + (i % 5) * 30),
      y: Math.sin(angle) * (90 + (i % 5) * 25),
      delay: (i % 6) * 0.06,
    };
  }
);

const backgroundDecorations = Array.from(
  { length: 32 },
  (_, i) => ({
    id: i,
    symbol: ["♡", "✧", "✿", "❀", "✦"][i % 5],
    left: `${(i * 37 + 9) % 96}%`,
    top: `${(i * 23 + 7) % 94}%`,
    delay: `${-(i % 7)}s`,
  })
);

type HeartDrop = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  symbol: string;
};

function MemoryPhoto({
  image,
  caption,
  rotation,
  index,
}: {
  image: string;
  caption: string;
  rotation: number;
  index: number;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="sw-finale-polaroid"
      style={
        {
          "--photo-rotation": `${rotation}deg`,
          "--photo-delay": `${index * 0.18}s`,
        } as React.CSSProperties
      }
    >
      <div className="sw-finale-photo-frame">
        {hasError ? (
          <div className="sw-finale-photo-placeholder">
            <Camera size={30} strokeWidth={1.4} />
            <span>Our Memory</span>
            <Heart size={15} fill="currentColor" />
          </div>
        ) : (
          // Local photo files in /public/images/home/finale/
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={caption}
            onError={() => setHasError(true)}
          />
        )}
      </div>

      <span className="sw-finale-photo-caption">
        {caption}
      </span>
    </div>
  );
}

export default function FinalSurprise() {
  const [phase, setPhase] =
    useState<SurprisePhase>("closed");

  const [heartDrops, setHeartDrops] =
    useState<HeartDrop[]>([]);

  const [hugCount, setHugCount] = useState(0);

  const openTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const rainTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (rainTimer.current) clearTimeout(rainTimer.current);
    };
  }, []);

  const openSurprise = () => {
    if (phase !== "closed") return;

    setPhase("opening");

    openTimer.current = setTimeout(() => {
      setPhase("revealed");
    }, 1400);
  };

  const sendHug = () => {
    if (rainTimer.current) clearTimeout(rainTimer.current);

    const newDrops = Array.from(
      { length: 65 },
      (_, i) => ({
        id: hugCount * 100 + i,
        left: (i * 37 + 11) % 100,
        delay: (i % 13) * 0.13,
        duration: 3.5 + (i % 6) * 0.45,
        size: 16 + (i % 5) * 8,
        symbol: ["♥", "♡", "❤", "✿"][i % 4],
      })
    );

    setHugCount((count) => count + 1);
    setHeartDrops(newDrops);

    rainTimer.current = setTimeout(() => {
      setHeartDrops([]);
    }, 8500);
  };

  const resetSurprise = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (rainTimer.current) clearTimeout(rainTimer.current);

    setHeartDrops([]);
    setPhase("closed");
  };

  return (
    <section className="sw-finale" id="final-surprise">

      {/* BACKGROUND DECORATIONS */}
      <div className="sw-finale-decor" aria-hidden="true">
        {backgroundDecorations.map((item) => (
          <span
            key={item.id}
            style={{
              left: item.left,
              top: item.top,
              animationDelay: item.delay,
            }}
          >
            {item.symbol}
          </span>
        ))}
      </div>

      {/* HEART RAIN */}
      <div
        className="sw-finale-heart-rain"
        aria-hidden="true"
      >
        {heartDrops.map((drop) => (
          <span
            key={drop.id}
            style={
              {
                left: `${drop.left}%`,
                fontSize: `${drop.size}px`,
                animationDelay: `${drop.delay}s`,
                animationDuration: `${drop.duration}s`,
              } as React.CSSProperties
            }
          >
            {drop.symbol}
          </span>
        ))}
      </div>

      {/* HEADER */}
      <div className="sw-finale-header">
        <div className="sw-finale-eyebrow">
          <Sparkles size={15} />
          <span>THE FINAL CHAPTER</span>
          <Sparkles size={15} />
        </div>

        <h2>
          One Last <em>Surprise</em>
        </h2>

        <p>
          Before this little journey ends,
          there&apos;s one more thing waiting
          just for you.
        </p>
      </div>

      {/* GIFT SCENE */}
      <div className={`sw-finale-scene is-${phase}`}>

        <div className="sw-finale-gift-area">

          {/* HEART BURST */}
          <div
            className="sw-finale-particles"
            aria-hidden="true"
          >
            {burstParticles.map((particle) => (
              <span
                key={particle.id}
                style={
                  {
                    "--particle-x": `${particle.x}px`,
                    "--particle-y": `${particle.y}px`,
                    "--particle-delay": `${particle.delay}s`,
                  } as React.CSSProperties
                }
              >
                {particle.symbol}
              </span>
            ))}
          </div>

          {/* INTERACTIVE GIFT BOX */}
          <button
            type="button"
            className="sw-finale-gift"
            onClick={openSurprise}
            disabled={phase !== "closed"}
            aria-label="Open your final surprise"
          >
            <span className="sw-finale-gift-lid">
              <span className="sw-finale-lid-ribbon" />

              <span className="sw-finale-gift-bow">
                <span className="sw-finale-bow-left" />
                <span className="sw-finale-bow-center" />
                <span className="sw-finale-bow-right" />
              </span>
            </span>

            <span className="sw-finale-gift-body">
              <span className="sw-finale-gift-ribbon" />

              <span className="sw-finale-gift-heart">
                <Heart size={28} fill="currentColor" />
              </span>
            </span>

            <span className="sw-finale-gift-shadow" />
          </button>
        </div>

        {phase === "closed" && (
          <p className="sw-finale-hint">
            <Gift size={16} />
            Tap the gift to open our little memories
          </p>
        )}

        {phase === "opening" && (
          <p className="sw-finale-hint" role="status">
            Unwrapping our sweetest memories...
          </p>
        )}

        {/* REVEALED CONTENT */}
        {phase === "revealed" && (
          <div className="sw-finale-reveal">

            <div className="sw-finale-reveal-eyebrow">
              <Heart size={15} fill="currentColor" />
              <span>A LITTLE COLLECTION OF ME</span>
              <Heart size={15} fill="currentColor" />
            </div>

            <h3 className="sw-finale-memory-title">
              PAP Orang Ganteng
              <br />
              <em>Dan Berprestasi.</em>
            </h3>

            <p className="sw-finale-memory-subtitle">
              Serah gua dong wkwkwkwkwkw.
            </p>

            {/* FLOATING POLAROIDS */}
            <div className="sw-finale-polaroid-gallery">
              {memories.map((memory, index) => (
                <MemoryPhoto
                  key={memory.image}
                  {...memory}
                  index={index}
                />
              ))}
            </div>

            {/* FINAL MESSAGE */}
            <div className="sw-finale-final-message">
              <div className="sw-finale-message-stars">
                <Sparkles size={19} />
                <span>MY FAVORITE UNIVERSE</span>
                <Sparkles size={19} />
              </div>

              <h3>
                In Every Universe,
                <br />
                I&apos;d Still
                <em> Choose You.</em>
              </h3>

              <p>
                Out of all the places, all the moments,
                and all the possible stories,
                I&apos;m so happy that this one
                has you in it.
              </p>

              <div className="sw-finale-heart-signature">
                <Heart size={17} fill="currentColor" />
                <span>SUMPAH AI</span>
                <Heart size={17} fill="currentColor" />
              </div>
            </div>

            {/* HUG BUTTON */}
            <button
              type="button"
              className="sw-finale-hug-button"
              onClick={sendHug}
            >
              <Heart size={19} fill="currentColor" />
              One More Love
            </button>

            <p className="sw-finale-hug-hint">
              A little extra love, just for you.
            </p>

            {/* RESET */}
            <button
              type="button"
              className="sw-finale-reset-button"
              onClick={resetSurprise}
            >
              <RotateCcw size={15} />
              Replay the Surprise
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="sw-finale-footer">
        <div className="sw-finale-footer-line" />

        <p>
          Made for Nana
        </p>

        <span>
          UR LITTLE WORLD
        </span>
      </footer>
    </section>
  );
}
