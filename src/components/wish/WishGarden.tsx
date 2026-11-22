
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Wish = {
  id: string;
  title: string;
  message: string;
  background: string;
  backgroundMobile: string;
  focusX: number;
  focusY: number;
};

const ROOT = "/images/wish";

const WISHES: Wish[] = [
  {
    id: "rose",
    title: "Forever Love",
    message:
      "May our love keep growing, just like the roses in this little garden.",
    background: `${ROOT}/backgrounds/bg-01-rose.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-01-rose.webp`,
    focusX: 50,
    focusY: 50,
  },
  {
    id: "blossom",
    title: "Little Happiness",
    message:
      "I hope every new day brings you another beautiful reason to smile.",
    background: `${ROOT}/backgrounds/bg-02-blossom.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-02-blossom.webp`,
    focusX: 50,
    focusY: 50,
  },
  {
    id: "love-letter",
    title: "A Love Letter",
    message:
      "Some feelings are too beautiful for words, but I will keep writing them for you.",
    background: `${ROOT}/backgrounds/bg-03-love-letter.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-03-love-letter.webp`,
    focusX: 50,
    focusY: 50,
  },
  {
    id: "strawberry",
    title: "Sweet Moments",
    message:
      "Here's to all the little memories that make our story so sweet.",
    background: `${ROOT}/backgrounds/bg-04-strawberry.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-04-strawberry.webp`,
    focusX: 50,
    focusY: 50,
  },
  {
    id: "daisy",
    title: "Beautiful Dreams",
    message:
      "May every dream you carry in your heart slowly bloom into something real.",
    background: `${ROOT}/backgrounds/bg-05-daisy.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-05-daisy.webp`,
    focusX: 50,
    focusY: 50,
  },
  {
    id: "ribbon",
    title: "Always You",
    message:
      "In every season, every chapter, and every little moment, I choose you.",
    background: `${ROOT}/backgrounds/bg-06-ribbon.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-06-ribbon.webp`,
    focusX: 50,
    focusY: 50,
  },
  {
    id: "tulip",
    title: "Growing Together",
    message:
      "I wish we always find new ways to grow, laugh, and dream together.",
    background: `${ROOT}/backgrounds/bg-07-tulip.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-07-tulip.webp`,
    focusX: 50,
    focusY: 50,
  },
  {
    id: "lantern",
    title: "A Little Light",
    message:
      "Whenever the world feels dark, may you always find warmth and light.",
    background: `${ROOT}/backgrounds/bg-08-lantern.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-08-lantern.webp`,
    focusX: 50,
    focusY: 50,
  },
  {
    id: "moonlight",
    title: "Under the Stars",
    message:
      "No matter how far our dreams may reach, I hope we always share the same sky.",
    background: `${ROOT}/backgrounds/bg-09-moonlight.webp`,
    backgroundMobile: `${ROOT}/backgrounds-mobile/bg-09-moonlight.webp`,
    focusX: 50,
    focusY: 50,
  },
];

const COUNT = WISHES.length;
const TAU = Math.PI * 2;

function wrapIndex(index: number) {
  return ((index % COUNT) + COUNT) % COUNT;
}

function shortestOffset(index: number, position: number) {
  const raw = index - position;

  return (
    ((raw + COUNT / 2) % COUNT + COUNT) % COUNT -
    COUNT / 2
  );
}

export default function WishGarden() {
  const stageRef = useRef<HTMLElement>(null);

  const positionRef = useRef(0);
  const targetRef = useRef(0);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPosition: number;
    moved: boolean;
    clickedIndex: number | null;
  } | null>(null);

  const [position, setPosition] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const [dimensions, setDimensions] = useState({
    width: 1200,
    height: 800,
  });

  const activeWish = WISHES[activeIndex];

  // =====================================
  // RESPONSIVE MEASUREMENTS
  // =====================================

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateSize = () => {
      const rect = stage.getBoundingClientRect();

      setDimensions({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  // =====================================
  // ROTATION CONTROLS
  // =====================================

  const rotateTo = useCallback((value: number) => {
    targetRef.current = value;
  }, []);

  const rotate = useCallback(
    (direction: number) => {
      rotateTo(
        Math.round(targetRef.current) + direction
      );
    },
    [rotateTo]
  );

  const selectOrb = useCallback(
    (index: number) => {
      const offset = shortestOffset(
        index,
        positionRef.current
      );

      rotateTo(positionRef.current + offset);
    },
    [rotateTo]
  );

  // =====================================
  // SMOOTH ANIMATION
  // =====================================

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();

    const animate = (now: number) => {
      const delta = Math.min(now - previous, 50);
      previous = now;

      if (!dragRef.current) {
        const difference =
          targetRef.current - positionRef.current;

        if (Math.abs(difference) > 0.0005) {
          const easing = 1 - Math.exp(-delta / 150);

          positionRef.current += difference * easing;
        } else {
          positionRef.current = targetRef.current;
        }
      }

      setPosition(positionRef.current);

      const nextIndex = wrapIndex(
        Math.round(positionRef.current)
      );

      setActiveIndex((current) =>
        current === nextIndex ? current : nextIndex
      );

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  // =====================================
  // MOUSE WHEEL / TRACKPAD SCROLL
  // =====================================

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let accumulatedDelta = 0;
    let lastWheelTime = 0;

    const handleWheel = (event: WheelEvent) => {
      // Allow browser zoom shortcuts.
      if (event.ctrlKey || event.metaKey) return;

      event.preventDefault();

      const now = performance.now();

      // Reset when user pauses scrolling.
      if (now - lastWheelTime > 250) {
        accumulatedDelta = 0;
      }

      lastWheelTime = now;

      const multiplier =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
          ? stage.clientHeight
          : 1;

      const delta =
        (Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX) * multiplier;

      accumulatedDelta += delta;

      const threshold = 85;

      if (Math.abs(accumulatedDelta) >= threshold) {
        const direction =
          accumulatedDelta > 0 ? 1 : -1;

        rotate(direction);
        accumulatedDelta = 0;
      }
    };

    stage.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      stage.removeEventListener("wheel", handleWheel);
    };
  }, [rotate]);

  // =====================================
  // KEYBOARD NAVIGATION
  // =====================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true']"
        )
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        rotate(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        rotate(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [rotate]);

  // =====================================
  // IMAGE PRELOADING
  // =====================================

  useEffect(() => {
    WISHES.forEach((wish) => {
      const desktop = new window.Image();
      desktop.src = wish.background;

      const mobile = new window.Image();
      mobile.src = wish.backgroundMobile;
    });
  }, []);

  // =====================================
  // DRAG & SWIPE
  // =====================================

  function handlePointerDown(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest(".wg-arrow")) return;

    const orb = target.closest<HTMLElement>(
      "[data-orb-index]"
    );

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: positionRef.current,
      moved: false,
      clickedIndex: orb
        ? Number(orb.dataset.orbIndex)
        : null,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLElement>
  ) {
    const drag = dragRef.current;

    if (
      !drag ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const deltaX = event.clientX - drag.startX;

    if (Math.abs(deltaX) > 7) {
      drag.moved = true;
    }

    if (!drag.moved) return;

    const sensitivity =
      dimensions.width <= 640 ? 125 : 220;

    positionRef.current =
      drag.startPosition - deltaX / sensitivity;

    targetRef.current = positionRef.current;
  }

  function handlePointerUp(
    event: ReactPointerEvent<HTMLElement>
  ) {
    const drag = dragRef.current;

    if (
      !drag ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    dragRef.current = null;

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    if (
      !drag.moved &&
      drag.clickedIndex !== null
    ) {
      selectOrb(drag.clickedIndex);
      return;
    }

    rotateTo(Math.round(positionRef.current));
  }

  function handlePointerCancel() {
    dragRef.current = null;
    rotateTo(Math.round(positionRef.current));
  }

  // =====================================
  // RESPONSIVE ORBIT GEOMETRY
  // =====================================

  const isMobile = dimensions.width <= 640;

  const shortSide = Math.min(
    dimensions.width,
    dimensions.height
  );

  const radiusX = isMobile
    ? dimensions.width * 0.35
    : Math.min(dimensions.width * 0.31, 410);

  const radiusY = isMobile
    ? Math.min(dimensions.height * 0.32, 245)
    : Math.min(dimensions.height * 0.36, 305);

  const baseOrbSize = isMobile
    ? Math.max(57, Math.min(82, shortSide * 0.20))
    : Math.max(96, Math.min(154, shortSide * 0.19));

  // =====================================
  // RENDER
  // =====================================

  return (
    <main className="wg-page">
      <section
        ref={stageRef}
        className="wg-stage"
        aria-label="Wish Garden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* DYNAMIC BACKGROUNDS */}

        <div
          className="wg-backgrounds"
          aria-hidden="true"
        >
          {WISHES.map((wish, index) => {
            const style = {
              backgroundImage: `url("${wish.background}")`,
              "--wg-mobile-bg":
                `url("${wish.backgroundMobile}")`,
            } as CSSProperties;

            return (
              <div
                key={wish.id}
                className={`wg-background-layer ${
                  index === activeIndex
                    ? "is-active"
                    : ""
                }`}
                style={style}
              />
            );
          })}

          <div className="wg-background-shade" />
          <div className="wg-background-vignette" />
        </div>

        {/* NINE GLASS PORTALS */}

        <div className="wg-orbit">
          {WISHES.map((wish, index) => {
            const offset = shortestOffset(
              index,
              position
            );

            const angle =
              -Math.PI / 2 +
              offset * (TAU / COUNT);

            const x = Math.cos(angle) * radiusX;
            const y = Math.sin(angle) * radiusY;

            const emphasis = Math.max(
              0,
              1 - Math.abs(offset)
            );

            const scale = 0.86 + emphasis * 0.27;

            const style = {
              width: baseOrbSize,
              height: baseOrbSize,
              zIndex: Math.round(
                100 + emphasis * 100 - y * 0.01
              ),
              transform: `
                translate(-50%, -50%)
                translate(${x}px, ${y}px)
                scale(${scale})
              `,
              "--wg-focus-x": `${wish.focusX}%`,
              "--wg-focus-y": `${wish.focusY}%`,
            } as CSSProperties;

            return (
              <button
                key={wish.id}
                type="button"
                data-orb-index={index}
                className={`wg-orb ${
                  index === activeIndex
                    ? "is-active"
                    : ""
                }`}
                style={style}
                aria-label={`View ${wish.title}`}
                aria-pressed={index === activeIndex}
              >
                <span className="wg-orb-frame">
                  <span className="wg-orb-inner">
                    <img
                      src={wish.background}
                      alt=""
                      draggable={false}
                    />
                  </span>

                  <span className="wg-orb-rim" />
                  <span className="wg-orb-reflection" />
                </span>
              </button>
            );
          })}
        </div>

        {/* CENTER WISH MESSAGE */}

        <div className="wg-center">
          <div
            key={activeWish.id}
            className="wg-center-content"
            aria-live="polite"
          >
            <h1>{activeWish.title}</h1>
            <p>{activeWish.message}</p>
          </div>
        </div>

        {/* ARROW NAVIGATION */}

        <button
          type="button"
          className="wg-arrow wg-arrow-left"
          onClick={() => rotate(-1)}
          aria-label="Previous wish"
        >
          ‹
        </button>

        <button
          type="button"
          className="wg-arrow wg-arrow-right"
          onClick={() => rotate(1)}
          aria-label="Next wish"
        >
          ›
        </button>
      </section>
    </main>
  );
}
