"use client";

import Image from "next/image";
import { ArrowDown, Heart, Sparkles } from "lucide-react";
import "./../../app/(protected)/hero.css";

const photos = [
  {
    src: "/images/home/hero/photo-1.jpg",
    caption: "my favorite ♡",
    position: "left-top",
  },
  {
    src: "/images/home/hero/photo-2.jpg",
    caption: "sweet moments ♡",
    position: "left-bottom",
  },
  {
    src: "/images/home/hero/photo-3.jpg",
    caption: "my sunshine ♡",
    position: "right-top",
  },
  {
    src: "/images/home/hero/photo-4.jpg",
    caption: "forever us ♡",
    position: "right-bottom",
  },
];

export default function HeroSection() {
  const scrollToUniverse = () => {
    const target = document.getElementById("universe");

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      document.querySelector("section:nth-of-type(2)")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="sw-hero" id="home">
      <div className="sw-hero-texture" aria-hidden="true" />
      <span className="sw-hero-art sw-hero-art-1">♡</span>
      <span className="sw-hero-art sw-hero-art-2">✿</span>
      <span className="sw-hero-art sw-hero-art-3">✧</span>
      <span className="sw-hero-art sw-hero-art-4">♡</span>
      <span className="sw-hero-art sw-hero-art-5">✦</span>
      <span className="sw-hero-art sw-hero-art-6">✿</span>
      <span className="sw-hero-art sw-hero-art-7">♡</span>
      <span className="sw-hero-art sw-hero-art-8">✧</span>

      {/* Dekorasi kiri dan kanan */}
      <div className="sw-hero-decor sw-hero-decor-left">
        <Image
          src="/images/home/hero/hero-floral-left.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 150px, 380px"
          className="sw-hero-decor-image"
          priority
        />
      </div>

      <div className="sw-hero-decor sw-hero-decor-right">
        <Image
          src="/images/home/hero/hero-floral-right.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 150px, 380px"
          className="sw-hero-decor-image"
          priority
        />
      </div>

      {/* Empat foto polaroid */}
      <div className="sw-hero-photo-layer">
        {photos.map((photo, index) => (
          <div
            className={`sw-hero-polaroid sw-hero-polaroid-${photo.position}`}
            key={photo.position}
          >
            <div className="sw-hero-photo-frame">
              <Image
                src={photo.src}
                alt={`Our memory ${index + 1}`}
                fill
                sizes="(max-width: 768px) 110px, 220px"
                className="sw-hero-photo-image"
              />
            </div>
            <span className="sw-hero-photo-caption">
              {photo.caption}
            </span>
          </div>
        ))}
      </div>

      {/* Konten utama */}
      <div className="sw-hero-content">
        <div className="sw-hero-eyebrow">
          <Sparkles size={14} />
          <span>A LITTLE WORLD MADE JUST FOR YOU</span>
          <Sparkles size={14} />
        </div>

        <div className="sw-hero-heading">
          <span className="sw-hero-welcome">Welcome to</span>

          <h1>
            <span>Nana World</span>
          </h1>

          <div className="sw-hero-heading-decoration">
            <span />
            <Heart size={22} strokeWidth={1.6} />
            <span />
          </div>
        </div>

        <p className="sw-hero-description">
          A little universe filled with ur sweetest memories,
          tiny surprises, and all the love I have for you.
        </p>

        <button
          type="button"
          className="sw-hero-button"
          onClick={scrollToUniverse}
        >
          <span>Explore Ur World</span>
          <Heart size={19} strokeWidth={1.8} />
        </button>

        <p className="sw-hero-signature">
          made with all my heart, just for you ♡
        </p>
      </div>

      <button
        type="button"
        className="sw-hero-scroll"
        onClick={scrollToUniverse}
        aria-label="Scroll to explore"
      >
        <span>SCROLL TO EXPLORE</span>
        <ArrowDown size={19} />
      </button>
    </section>
  );
}
