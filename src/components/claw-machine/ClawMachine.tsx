
"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  clawPrizes,
  plushInstances,
  getPrizeById,
  TOTAL_PRIZES,
  type ClawPrize,
} from "@/data/clawPrizes";

import type { GamePhase } from "./ClawScene";

const ClawScene = dynamic(
  () => import("./ClawScene"),
  {
    ssr: false,
    loading: () => (
      <div className="nw-loading">
        Loading Nana's Arcade... ♡
      </div>
    ),
  }
);

const MIN_X = -1.35;
const MAX_X = 1.35;
const STEP = 0.055;
const RETURN_X = -1.15;

export default function ClawMachine() {
  const [clawX, setClawX] = useState(0);
  const clawXRef = useRef(0);

  const [phase, setPhase] =
    useState<GamePhase>("idle");
  const phaseRef = useRef<GamePhase>("idle");

  const [phaseStartedAt, setPhaseStartedAt] =
    useState(0);

  const [removedIds, setRemovedIds] =
    useState<string[]>([]);
  const removedRef = useRef<string[]>([]);

  const [collected, setCollected] =
    useState<string[]>([]);

  const [heldInstanceId, setHeldInstanceId] =
    useState<string | null>(null);
  const heldRef = useRef<string | null>(null);

  const [wonPrize, setWonPrize] =
    useState<ClawPrize | null>(null);

  const [soundOn, setSoundOn] = useState(true);

  const [message, setMessage] = useState(
    "Move the claw and catch a little love! ♡"
  );

  const movementTimer = useRef<
    ReturnType<typeof setInterval> | null
  >(null);

  const phaseCompletedRef = useRef(false);

  const changePhase = useCallback(
    (next: GamePhase) => {
      phaseRef.current = next;
      phaseCompletedRef.current = false;

      setPhase(next);
      setPhaseStartedAt(performance.now());
    },
    []
  );

  const playSound = useCallback(
    (frequency: number) => {
      if (!soundOn) return;

      try {
        const context = new AudioContext();
        const oscillator =
          context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(
          0.035,
          context.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          context.currentTime + 0.14
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();
        oscillator.stop(
          context.currentTime + 0.14
        );

        oscillator.onended = () => {
          void context.close();
        };
      } catch {
        // Audio effects are optional.
      }
    },
    [soundOn]
  );

  const stopMovement = useCallback(() => {
    if (movementTimer.current !== null) {
      clearInterval(movementTimer.current);
      movementTimer.current = null;
    }
  }, []);

  const moveClaw = useCallback(
    (direction: number) => {
      if (phaseRef.current !== "idle") return;

      const next = Math.max(
        MIN_X,
        Math.min(
          MAX_X,
          clawXRef.current + direction * STEP
        )
      );

      clawXRef.current = next;
      setClawX(next);
    },
    []
  );

  const startMovement = useCallback(
    (direction: number) => {
      if (phaseRef.current !== "idle") return;

      stopMovement();
      moveClaw(direction);

      movementTimer.current = setInterval(
        () => moveClaw(direction),
        25
      );
    },
    [moveClaw, stopMovement]
  );

  const dropClaw = useCallback(() => {
    if (phaseRef.current !== "idle") return;

    if (
      removedRef.current.length >=
      plushInstances.length
    ) {
      setMessage(
        "You caught every plushie! ♡"
      );
      return;
    }

    stopMovement();
    setWonPrize(null);

    setMessage("The claw is going down...");
    playSound(480);

    changePhase("dropping");
  }, [
    changePhase,
    playSound,
    stopMovement,
  ]);

  const completePhase = useCallback(() => {
    if (phaseCompletedRef.current) return;

    phaseCompletedRef.current = true;

    const current = phaseRef.current;

    if (current === "dropping") {
      setMessage("Trying to grab a plushie...");
      playSound(380);
      changePhase("grabbing");
      return;
    }

    if (current === "grabbing") {
      const available = plushInstances
        .filter(
          (item) =>
            !removedRef.current.includes(item.id)
        )
        .sort((a, b) => {
          const distanceA =
            Math.abs(a.x - clawXRef.current) +
            Math.abs(a.z) * 0.15;

          const distanceB =
            Math.abs(b.x - clawXRef.current) +
            Math.abs(b.z) * 0.15;

          return distanceA - distanceB;
        });

      const closest = available[0];

      const distance = closest
        ? Math.abs(closest.x - clawXRef.current)
        : Infinity;

      const success =
        closest !== undefined &&
        distance <= 0.3 &&
        Math.random() < 0.85;

      const caughtId = success
        ? closest.id
        : null;

      heldRef.current = caughtId;
      setHeldInstanceId(caughtId);

      setMessage(
        caughtId
          ? "You caught something! ♡"
          : "Oops! The claw slipped!"
      );

      changePhase("lifting");
      return;
    }

    if (current === "lifting") {
      setMessage(
        heldRef.current
          ? "Bringing your prize home..."
          : "Almost! Try again, my love."
      );

      changePhase("returning");
      return;
    }

    if (current === "returning") {
      changePhase("releasing");
      return;
    }

    if (current === "releasing") {
      const caughtId = heldRef.current;

      if (caughtId) {
        const instance = plushInstances.find(
          (item) => item.id === caughtId
        );

        const prize = instance
          ? getPrizeById(instance.prizeId)
          : undefined;

        removedRef.current = [
          ...removedRef.current,
          caughtId,
        ];

        setRemovedIds([
          ...removedRef.current,
        ]);

        if (prize) {
          setCollected((previous) =>
            previous.includes(prize.id)
              ? previous
              : [...previous, prize.id]
          );

          setWonPrize(prize);
          setMessage(
            `You won ${prize.name}! ♡`
          );
          playSound(850);
        }
      } else {
        setMessage(
          "So close! Try another grab ♡"
        );
      }

      heldRef.current = null;
      setHeldInstanceId(null);

      clawXRef.current = RETURN_X;
      setClawX(RETURN_X);

      changePhase("idle");
    }
  }, [changePhase, playSound]);

  const dropRef = useRef(dropClaw);
  dropRef.current = dropClaw;

  useEffect(() => {
    const pressed = new Set<string>();

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (
          ["INPUT", "TEXTAREA", "SELECT"].includes(
            target.tagName
          ) ||
          target.isContentEditable
        )
      ) {
        return;
      }

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.code === "Space"
      ) {
        event.preventDefault();
      }

      if (event.repeat) return;

      if (event.key === "ArrowLeft") {
        if (pressed.has("ArrowLeft")) return;

        pressed.add("ArrowLeft");
        startMovement(-1);
      }

      if (event.key === "ArrowRight") {
        if (pressed.has("ArrowRight")) return;

        pressed.add("ArrowRight");
        startMovement(1);
      }

      if (event.code === "Space") {
        if (pressed.has("Space")) return;

        pressed.add("Space");
        dropRef.current();
      }
    };

    const handleKeyUp = (
      event: KeyboardEvent
    ) => {
      pressed.delete(event.key);

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        stopMovement();

        if (pressed.has("ArrowLeft")) {
          startMovement(-1);
        } else if (
          pressed.has("ArrowRight")
        ) {
          startMovement(1);
        }
      }
    };

    const handleBlur = () => {
      pressed.clear();
      stopMovement();
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );

      stopMovement();
    };
  }, [
    startMovement,
    stopMovement,
  ]);

  function resetGame() {
    if (phaseRef.current !== "idle") return;

    stopMovement();

    removedRef.current = [];
    heldRef.current = null;
    clawXRef.current = 0;

    setRemovedIds([]);
    setCollected([]);
    setHeldInstanceId(null);
    setWonPrize(null);
    setClawX(0);

    setMessage(
      "Let's play again, my love! ♡"
    );
  }

  const busy = phase !== "idle";

  return (
    <main className="nw-arcade-page">
      <div
        className="nw-arcade-backdrop"
        aria-hidden="true"
      />

      <div
        className="nw-arcade-overlay"
        aria-hidden="true"
      />

      <header className="nw-arcade-header">
        <span>
          ✧ WELCOME TO NANA WORLD ✧
        </span>

        <h1>Claw Machine ♡</h1>

        <p>
          A little game, a lot of love.
        </p>
      </header>

      <div className="nw-arcade-layout">
        {/* LEFT: HOW TO PLAY */}
        <aside className="nw-arcade-card nw-how-to">
          <div className="nw-card-bow">
            🎀
          </div>

          <span className="nw-card-eyebrow">
            NANA WORLD ARCADE
          </span>

          <h2>How to Play ♡</h2>

          <div className="nw-instructions">
            <div className="nw-instruction">
              <span className="nw-instruction-icon">
                ↔
              </span>
              <p>Move the claw</p>
            </div>

            <div className="nw-instruction">
              <span className="nw-instruction-icon">
                ↓
              </span>
              <p>Press DROP</p>
            </div>

            <div className="nw-instruction">
              <span className="nw-instruction-icon">
                ♡
              </span>
              <p>Catch a surprise!</p>
            </div>
          </div>

          <div className="nw-controls">
            <div className="nw-direction-buttons">
              <button
                type="button"
                disabled={busy}
                aria-label="Move claw left"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(
                    event.pointerId
                  );
                  startMovement(-1);
                }}
                onPointerUp={stopMovement}
                onPointerCancel={stopMovement}
                onLostPointerCapture={
                  stopMovement
                }
              >
                ←
              </button>

              <button
                type="button"
                disabled={busy}
                aria-label="Move claw right"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(
                    event.pointerId
                  );
                  startMovement(1);
                }}
                onPointerUp={stopMovement}
                onPointerCancel={stopMovement}
                onLostPointerCapture={
                  stopMovement
                }
              >
                →
              </button>
            </div>

            <button
              type="button"
              className="nw-drop-button"
              disabled={busy}
              onClick={dropClaw}
            >
              {busy
                ? "GRABBING..."
                : "♡ DROP CLAW"}
            </button>
          </div>

          <p className="nw-keyboard-help">
            ← → MOVE · SPACE DROP
          </p>

          <button
            type="button"
            className="nw-sound-toggle"
            onClick={() =>
              setSoundOn((previous) => !previous)
            }
          >
            {soundOn
              ? "♫ Sound On"
              : "♪ Sound Off"}
          </button>
        </aside>

        {/* CENTER: 3D MACHINE */}
        <section
          className="nw-machine-stage"
          aria-label="3D claw machine game"
        >
          <div className="nw-machine-canvas">
            <ClawScene
              clawX={clawX}
              phase={phase}
              phaseStartedAt={phaseStartedAt}
              removedIds={removedIds}
              heldInstanceId={heldInstanceId}
              onPhaseComplete={completePhase}
            />
          </div>

          <div
            className="nw-game-status"
            role="status"
            aria-live="polite"
          >
            <span className="nw-status-dot" />
            {message}
          </div>
        </section>

        {/* RIGHT: COLLECTION */}
        <aside className="nw-arcade-card nw-collection">
          <div className="nw-card-bow">
            🎀
          </div>

          <span className="nw-card-eyebrow">
            LITTLE TREASURES
          </span>

          <h2>Your Collection ♡</h2>

          <div className="nw-prize-grid">
            {clawPrizes.map((prize) => {
              const unlocked =
                collected.includes(prize.id);

              return (
                <div
                  key={prize.id}
                  className={
                    "nw-prize-slot" +
                    (unlocked
                      ? " unlocked"
                      : "")
                  }
                  title={prize.name}
                >
                  {unlocked ? (
                    <img
                      src={prize.preview}
                      alt={prize.name}
                    />
                  ) : (
                    <span>♡</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="nw-collection-progress">
            {collected.length} / {TOTAL_PRIZES} Collected
          </div>

          <div className="nw-progress-track">
            <div
              className="nw-progress-fill"
              style={{
                width: `${
                  (collected.length /
                    TOTAL_PRIZES) *
                  100
                }%`,
              }}
            />
          </div>

          <button
            type="button"
            className="nw-play-again"
            disabled={busy}
            onClick={resetGame}
          >
            ↻ Play Again
          </button>

          <p className="nw-collection-note">
            Every little prize holds
            a special message for you.
          </p>
        </aside>
      </div>

      {/* REWARD MODAL */}
      {wonPrize && (
        <div className="nw-reward-overlay">
          <div
            className="nw-reward-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nw-reward-title"
          >
            <span className="nw-reward-stars">
              ✦ ♡ ✦
            </span>

            <img
              src={wonPrize.preview}
              alt={wonPrize.name}
              className="nw-reward-image"
            />

            <span className="nw-card-eyebrow">
              YOU GOT A PRIZE!
            </span>

            <h2 id="nw-reward-title">
              {wonPrize.name} ♡
            </h2>

            <p>{wonPrize.message}</p>

            <button
              type="button"
              autoFocus
              onClick={() =>
                setWonPrize(null)
              }
            >
              Keep My Prize ♡
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
