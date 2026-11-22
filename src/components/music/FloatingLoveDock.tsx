
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Heart,
  House,
  LogOut,
  Play,
  Pause,
  LoaderCircle,
  SkipBack,
  SkipForward,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useMusic } from "./MusicProvider";

import "./floating-love-dock.css";

const AUTO_COLLAPSE_DELAY = 5000;
const SCROLL_THRESHOLD = 8;

export default function FloatingLoveDock() {
  const router = useRouter();

  const {
    isPlaying,
    toggle,
    next,
    previous,
    stopAll,
  } = useMusic();

  const [expanded, setExpanded] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const timerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const lastScrollY = useRef(0);
  const expandedRef = useRef(true);

  // =========================================
  // TIMER MANAGEMENT
  // =========================================

  const clearCollapseTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // =========================================
  // COLLAPSE DOCK
  // =========================================

  const collapseDock = useCallback(() => {
    clearCollapseTimer();

    expandedRef.current = false;
    setExpanded(false);
  }, [clearCollapseTimer]);

  // =========================================
  // EXPAND DOCK
  // =========================================

  const expandDock = useCallback(() => {
    clearCollapseTimer();

    expandedRef.current = true;
    setExpanded(true);

    timerRef.current = setTimeout(() => {
      expandedRef.current = false;
      setExpanded(false);
      timerRef.current = null;
    }, AUTO_COLLAPSE_DELAY);
  }, [clearCollapseTimer]);

  // =========================================
  // INITIAL AUTO COLLAPSE
  // =========================================

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    // Normal saat website pertama dibuka.
    // Otomatis mengecil setelah 5 detik.
    expandDock();

    return () => {
      clearCollapseTimer();
    };
  }, [expandDock, clearCollapseTimer]);

  // =========================================
  // SCROLL BEHAVIOR
  // =========================================

  useEffect(() => {
    const handleScroll = () => {
      const currentY = Math.max(
        0,
        window.scrollY
      );

      const difference =
        currentY - lastScrollY.current;

      // Abaikan perubahan scroll yang kecil.
      if (
        Math.abs(difference) <
        SCROLL_THRESHOLD
      ) {
        return;
      }

      lastScrollY.current = currentY;

      if (difference > 0) {
        // Scroll ke bawah.
        collapseDock();
      } else {
        // Scroll ke atas.
        expandDock();
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [collapseDock, expandDock]);

  // =========================================
  // MUSIC CONTROLS
  // =========================================

  const handlePrevious = () => {
    previous();
    expandDock();
  };

  const handleToggle = () => {
    toggle();
    expandDock();
  };

  const handleNext = () => {
    next();
    expandDock();
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      stopAll();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      setLogoutError(
        "Logout failed. Please try again."
      );

      setLoggingOut(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <aside
      className="sw-love-dock-position"
      aria-label="Nana World Love Dock"
    >
      <div
        className={`sw-love-dock ${
          expanded
            ? "is-expanded"
            : "is-collapsed"
        }`}
      >
        {/* EXPANDED CONTENT */}
        <div
          className={`sw-love-dock-inner ${
            expanded
              ? "is-visible"
              : "is-hidden"
          }`}
          aria-hidden={!expanded}
          inert={!expanded}
        >
          {/* BRAND */}
          <div className="sw-love-dock-brand">
            <span className="sw-love-dock-brand-icon">
              <Heart
                size={19}
                fill="currentColor"
              />
            </span>

            <div className="sw-love-dock-brand-text">
              <strong>
                Nana World ♡
              </strong>

              <span>
                Every little moment with you is magic.
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="sw-love-dock-actions">
            {/* PREVIOUS */}
            <button
              type="button"
              className="sw-love-dock-action sw-love-dock-track"
              onClick={handlePrevious}
              aria-label="Previous song"
              title="Previous song"
            >
              <SkipBack
                size={17}
                fill="currentColor"
              />
            </button>

            {/* PLAY / PAUSE */}
            <button
              type="button"
              className="sw-love-dock-play"
              onClick={handleToggle}
              aria-label={
                isPlaying
                  ? "Pause music"
                  : "Play music"
              }
              title={
                isPlaying
                  ? "Pause music"
                  : "Play music"
              }
            >
              {isPlaying ? (
                <Pause
                  size={18}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={18}
                  fill="currentColor"
                />
              )}
            </button>

            {/* NEXT */}
            <button
              type="button"
              className="sw-love-dock-action sw-love-dock-track"
              onClick={handleNext}
              aria-label="Next song"
              title="Next song"
            >
              <SkipForward
                size={17}
                fill="currentColor"
              />
            </button>

            {/* HOME */}
            <button
              type="button"
              className="sw-love-dock-action"
              onClick={() => {
                router.push("/");
              }}
              aria-label="Go to Home"
              title="Home"
            >
              <House size={18} />
            </button>

            {/* LOGOUT */}
            <button
              type="button"
              className="sw-love-dock-action"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Logout"
              title="Logout"
            >
              {loggingOut ? (
                <LoaderCircle
                  size={18}
                  className="sw-love-dock-spinner"
                />
              ) : (
                <LogOut size={18} />
              )}
            </button>

            {/* MINIMIZE */}
            <button
              type="button"
              className="sw-love-dock-collapse"
              onClick={collapseDock}
              aria-label="Minimize Love Dock"
              title="Minimize"
            >
              <Heart
                size={18}
                fill="currentColor"
              />
            </button>
          </div>
        </div>

        {/* COLLAPSED HEART */}
        <button
          type="button"
          className={`sw-love-dock-heart ${
            isPlaying
              ? "is-playing"
              : ""
          }`}
          onClick={expandDock}
          aria-label="Expand Love Dock"
          aria-hidden={expanded}
          tabIndex={expanded ? -1 : 0}
          disabled={expanded}
        >
          <Heart
            size={25}
            fill="currentColor"
          />
        </button>
      </div>

      {/* LOGOUT ERROR */}
      {logoutError && (
        <div
          className="sw-love-dock-notice"
          role="alert"
        >
          {logoutError}
        </div>
      )}
    </aside>
  );
}
