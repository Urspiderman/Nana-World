"use client";

import { Play, Pause, Music2, Heart } from "lucide-react";
import { useMusic } from "@/components/music/MusicProvider";

export default function PlaylistPage() {
  const {
    songs,
    currentIndex,
    isPlaying,
    selectSong,
    toggle,
  } = useMusic();

  return (
    <main className="sw-playlist-page">
      <div className="sw-playlist-inner">
        <Heart className="sw-playlist-heart" size={32} />

        <span className="sw-eyebrow">
          OUR LITTLE SOUNDTRACK
        </span>

        <h1>Our Special Playlist</h1>
        <p>
          Ten songs, each holding a little piece of us.
          Choose one to start listening.
        </p>

        <div className="sw-song-grid">
          {songs.map((song, index) => {
            const selected = currentIndex === index;

            return (
              <button
                key={song.id}
                className={`sw-song-item ${
                  selected ? "selected" : ""
                }`}
                onClick={() =>
                  selected ? toggle() : selectSong(index)
                }
              >
                <div className="sw-song-cover">
                  <Music2 size={24} />
                </div>

                <div className="sw-song-info">
                  <strong>{song.title}</strong>
                  <small>{song.artist}</small>
                </div>

                <span className="sw-song-play">
                  {selected && isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}