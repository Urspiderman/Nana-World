
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { globalSongs, type Song } from "@/data/playlist";

type MusicContextValue = {
  mode: "global";
  songs: Song[];
  currentSong: Song | null;
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  blocked: boolean;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  selectSong: (index: number) => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  stopAll: () => void;
};

const Context = createContext<MusicContextValue | null>(null);

export function useMusic() {
  const value = useContext(Context);

  if (!value) {
    throw new Error("MusicProvider is missing");
  }

  return value;
}

export default function MusicProvider({
  children,
}: {
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const initialized = useRef(false);
  const currentIndexRef = useRef(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.65);
  const [blocked, setBlocked] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const safePlay = useCallback(
    async (audio: HTMLAudioElement | null) => {
      if (!audio) return;

      try {
        await audio.play();
        setBlocked(false);
      } catch {
        setBlocked(true);
      }
    },
    []
  );

  const play = useCallback(() => {
    void safePlay(audioRef.current);
  }, [safePlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      play();
    } else {
      pause();
    }
  }, [play, pause]);

  const switchTrack = useCallback(
    (index: number, shouldPlay: boolean) => {
      const audio = audioRef.current;

      if (
        !audio ||
        index < 0 ||
        index >= globalSongs.length
      ) {
        return;
      }

      audio.pause();
      audio.src = globalSongs[index].src;
      audio.load();

      currentIndexRef.current = index;
      setCurrentIndex(index);

      setTime(0);
      setDuration(0);
      setBlocked(false);

      if (shouldPlay) {
        void safePlay(audio);
      }
    },
    [safePlay]
  );

  const next = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || globalSongs.length === 0) {
      return;
    }

    const nextIndex =
      (currentIndexRef.current + 1) %
      globalSongs.length;

    switchTrack(nextIndex, !audio.paused);
  }, [switchTrack]);

  const previous = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || globalSongs.length === 0) {
      return;
    }

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setTime(0);
      return;
    }

    const previousIndex =
      (currentIndexRef.current - 1 +
        globalSongs.length) %
      globalSongs.length;

    switchTrack(previousIndex, !audio.paused);
  }, [switchTrack]);

  const selectSong = useCallback(
    (index: number) => {
      switchTrack(index, true);
    },
    [switchTrack]
  );

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration)) {
      return;
    }

    audio.currentTime = Math.max(
      0,
      Math.min(seconds, audio.duration)
    );

    setTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(
      Math.max(0, Math.min(1, value))
    );
  }, []);

  const stopAll = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setIsPlaying(false);
    setTime(0);
    setDuration(0);
    setBlocked(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    if (globalSongs.length > 0) {
      void safePlay(audioRef.current);
    }
  }, [safePlay]);

  const currentSong =
    globalSongs[currentIndex] ?? null;

  return (
    <Context.Provider
      value={{
        mode: "global",
        songs: globalSongs,
        currentSong,
        currentIndex,
        isPlaying,
        currentTime: time,
        duration,
        volume,
        blocked,
        toggle,
        play,
        pause,
        next,
        previous,
        selectSong,
        seek,
        setVolume,
        stopAll,
      }}
    >
      {children}

      {globalSongs.length > 0 && (
        <audio
          ref={audioRef}
          src={globalSongs[0].src}
          preload="auto"
          onPlay={() => {
            setIsPlaying(true);
          }}
          onPause={() => {
            setIsPlaying(false);
          }}
          onEnded={() => {
            const nextIndex =
              (currentIndexRef.current + 1) %
              globalSongs.length;

            switchTrack(nextIndex, true);
          }}
          onTimeUpdate={(event) => {
            setTime(
              event.currentTarget.currentTime
            );
          }}
          onLoadedMetadata={(event) => {
            setDuration(
              Number.isFinite(
                event.currentTarget.duration
              )
                ? event.currentTarget.duration
                : 0
            );
          }}
        />
      )}
    </Context.Provider>
  );
}
