
"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Gamepad2,
  Images,
  Mail,
  Sparkles,
} from "lucide-react";

import "../../app/(protected)/universe.css";

/* =========================================
   WORLD DATA
========================================= */

const worlds = [
  {
    title: "Memory Lane",
    subtitle: "Ur sweetest memories",
    description: "Every little favorite moment of you.",
    href: "/memories",
    Icon: Images,
    image: "/images/home/universe/memory-lane.webp",
    color: "#F9C8D9",
  },
  {
    title: "Wish Garden",
    subtitle: "Dreams we'll grow together",
    description: "A little garden for ur biggest dreams.",
    href: "/wish",
    Icon: Flower2,
    image: "/images/home/universe/wish-garden.webp",
    color: "#F7D2D9",
  },
  {
    title: "Love Letters",
    subtitle: "Words from my heart",
    description: "Some feelings deserve to be kept forever.",
    href: "/letters",
    Icon: Mail,
    image: "/images/home/universe/love-letters.webp",
    color: "#F6C9D6",
  },
  {
    title: "Claw Machine",
    subtitle: "Catch a little surprise",
    description: "A tiny game with something sweet inside.",
    href: "/claw-machine",
    Icon: Gamepad2,
    image: "/images/home/universe/claw-machine.webp",
    color: "#F5D5E6",
  },
  {
    title: "Photo Booth",
    subtitle: "Let's make a memory",
    description: "Smile, pose, and keep a moment forever.",
    href: "/photobooth",
    Icon: Camera,
    image: "/images/home/universe/photo-booth.webp",
    color: "#F5D1E2",
  },
];

/* =========================================
   BACKGROUND ORNAMENTS
========================================= */

const ornamentSymbols = [
  "♡", "✿", "✧", "✦", "❀",
  "♥", "✧", "♡", "✿", "✦",
];

const universeOrnaments = Array.from(
  { length: 60 },
  (_, index) => {
    const column = index % 12;
    const row = Math.floor(index / 12);

    return {
      id: index,
      symbol: ornamentSymbols[index % ornamentSymbols.length],
      left: 2 + column * 8.3 + ((index * 7) % 5),
      top: 4 + row * 19 + ((index * 11) % 9),
      size: 13 + ((index * 13) % 27),
      duration: 5 + (index % 6),
      delay: -(index % 9),
    };
  }
);

function UniverseBackgroundArt() {
  return (
    <div
      className="sw-universe-background-art"
      aria-hidden="true"
    >
      {universeOrnaments.map((ornament) => (
        <span
          key={ornament.id}
          className="sw-universe-ornament"
          style={
            {
              left: `${ornament.left}%`,
              top: `${ornament.top}%`,
              fontSize: `${ornament.size}px`,
              animationDuration: `${ornament.duration}s`,
              animationDelay: `${ornament.delay}s`,
            } as CSSProperties
          }
        >
          {ornament.symbol}
        </span>
      ))}
    </div>
  );
}

/* =========================================
   UNIVERSE CAROUSEL
========================================= */

export default function UniverseCarousel() {
  const [active, setActive] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const move = (direction: number) => {
    setActive(
      (current) =>
        (current + direction + worlds.length) % worlds.length
    );
  };

  /* Keyboard navigation */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const stage = stageRef.current;

      if (!stage || !stage.contains(document.activeElement)) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* Circular carousel positioning */
  const getOffset = (index: number) => {
    let difference = index - active;
    const half = worlds.length / 2;

    if (difference > half) {
      difference -= worlds.length;
    }

    if (difference < -half) {
      difference += worlds.length;
    }

    return difference;
  };

  return (
    <section className="sw-universe" id="universe">

      {/* BACKGROUND */}
      <div
        className="sw-universe-glow"
        aria-hidden="true"
      />

      <UniverseBackgroundArt />

      {/* HEADER */}
      <div className="sw-universe-header">
        <div className="sw-universe-eyebrow">
          <Sparkles size={15} />
          <span>OUR LITTLE UNIVERSE</span>
          <Sparkles size={15} />
        </div>

        <h2>Choose Your Adventure</h2>

        <p>
          Five little worlds, each filled with something
          special just for you.
        </p>
      </div>

      {/* CHARACTER SELECTION */}
      <div
        ref={stageRef}
        className="sw-universe-stage"
        role="region"
        aria-label="Choose your world"
        aria-roledescription="carousel"
        tabIndex={0}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;

          const difference =
            event.changedTouches[0].clientX -
            touchStartX.current;

          if (Math.abs(difference) > 45) {
            move(difference < 0 ? 1 : -1);
          }

          touchStartX.current = null;
        }}
      >
        {worlds.map((world, index) => {
          const offset = getOffset(index);
          const visible = Math.abs(offset) <= 1;
          const isActive = offset === 0;
          const Icon = world.Icon;

          const cardStyle = {
            "--world-color": world.color,
            "--offset": offset,
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? "auto" : "none",
            zIndex: isActive ? 3 : 2,
          } as CSSProperties;

          return (
            <div
              key={world.href}
              className={`sw-world-card ${
                isActive ? "sw-world-card-active" : ""
              }`}
              data-offset={offset}
              aria-hidden={!visible}
              inert={!visible}
              style={cardStyle}
              onClick={() => {
                if (!isActive) setActive(index);
              }}
            >
              <div className="sw-world-inner">

                {/* WORLD NUMBER */}
                <div className="sw-world-topline">
                  <span>
                    WORLD {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon size={19} />
                </div>

                {/* CLAY CHARACTER */}
                <div className="sw-world-art">
                  <div className="sw-world-art-circle">
                    <Image
                      src={world.image}
                      alt={`${world.title} 3D illustration`}
                      width={240}
                      height={240}
                      sizes="(max-width: 600px) 170px, 220px"
                      className="sw-world-character-image"
                      priority={index === 0}
                    />
                  </div>
                </div>

                {/* WORLD DESCRIPTION */}
                <div className="sw-world-copy">
                  <span className="sw-world-subtitle">
                    {world.subtitle}
                  </span>

                  <h3>{world.title}</h3>

                  <p>{world.description}</p>
                </div>

                {/* ACTION */}
                {isActive ? (
                  <Link
                    href={world.href}
                    className="sw-world-enter"
                  >
                    <span>Enter This World</span>
                    <ArrowUpRight size={18} />
                  </Link>
                ) : (
                  <div className="sw-world-preview">
                    Tap to select
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* PREVIOUS */}
        <button
          type="button"
          className="sw-universe-arrow sw-universe-arrow-left"
          onClick={() => move(-1)}
          aria-label="Previous world"
        >
          <ChevronLeft size={26} />
        </button>

        {/* NEXT */}
        <button
          type="button"
          className="sw-universe-arrow sw-universe-arrow-right"
          onClick={() => move(1)}
          aria-label="Next world"
        >
          <ChevronRight size={26} />
        </button>
      </div>

      {/* CAROUSEL INDICATORS */}
      <div className="sw-universe-bottom">

        <div className="sw-universe-counter">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <span className="sw-universe-counter-divider">/</span>
          <span>{String(worlds.length).padStart(2, "0")}</span>
        </div>

        <div className="sw-universe-dots">
          {worlds.map((world, index) => (
            <button
              key={world.href}
              type="button"
              className={`sw-universe-dot ${
                active === index ? "is-active" : ""
              }`}
              onClick={() => setActive(index)}
              aria-label={`Select ${world.title}`}
              aria-current={
                active === index ? "true" : undefined
              }
            />
          ))}
        </div>

        <p>Swipe or use the arrows to explore ♡</p>
      </div>
    </section>
  );
}
