"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { CoverArt } from "@/components/ui/cover-art";
import { Notice } from "@/components/ui/notice";
import { RecordSideHeading } from "@/components/ui/record-side-heading";
import type { RecordSide } from "@/lib/collection/types";
import {
  adjacentSample,
  sampleCueLabel,
  sampleCues,
  sampleNowPlaying,
  samplePositionState,
  sampleSeekRatio,
  sampleSeekSeconds,
  shouldToggleSampleOnSpace,
  type SampleCue,
} from "@/lib/deezer/preview";

interface RecordSamplePlayerProps {
  sides: RecordSide[];
  artist?: string;
  title?: string;
  coverUrl?: string | null;
}

export function RecordSamplePlayer({ sides, artist, title, coverUrl }: RecordSamplePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const cues = useMemo(() => sampleCues(sides), [sides]);
  const [queued, setQueued] = useState<SampleCue | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const canSkip = cues.length > 1;
  const previous = queued ? adjacentSample(cues, queued.key, -1) : null;
  const next = queued ? adjacentSample(cues, queued.key, 1) : null;
  const nowPlaying = queued
    ? sampleNowPlaying({
        track: sampleCueLabel(queued),
        artist,
        album: title,
        coverUrl,
      })
    : null;

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--rs-sample-dock", queued ? "4.75rem" : "0px");

    return () => {
      root.style.removeProperty("--rs-sample-dock");
    };
  }, [queued]);

  const startSample = useCallback(async (sample: SampleCue) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setQueued(sample);
    setProgress(0);
    setDuration(0);
    setError(null);
    audio.src = sample.url;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (cause) {
      setIsPlaying(false);
      setError(sampleErrorMessage(cause));
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !queued) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setError(null);
    } catch (cause) {
      setIsPlaying(false);
      setError(sampleErrorMessage(cause));
    }
  }, [isPlaying, queued]);

  const hearCue = useCallback(
    async (cue: SampleCue | null) => {
      if (!cue) {
        return;
      }

      await startSample(cue);
    },
    [startSample],
  );

  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    if (!nowPlaying) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying.title,
      artist: nowPlaying.artist,
      album: nowPlaying.album,
      artwork: nowPlaying.artwork
        ? [{ src: nowPlaying.artwork, sizes: "600x600", type: "image/jpeg" }]
        : [],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", () => {
      void togglePlayback();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      void togglePlayback();
    });
    navigator.mediaSession.setActionHandler("previoustrack", canSkip ? () => void hearCue(previous) : null);
    navigator.mediaSession.setActionHandler("nexttrack", canSkip ? () => void hearCue(next) : null);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    };
  }, [canSkip, hearCue, isPlaying, next, nowPlaying, previous, togglePlayback]);

  useEffect(() => {
    const position = samplePositionState({ duration, progress });

    if (!("mediaSession" in navigator) || !nowPlaying || !position) {
      return;
    }

    try {
      navigator.mediaSession.setPositionState(position);
    } catch {
      // Safari can reject position state before metadata is ready.
    }
  }, [duration, nowPlaying, progress]);

  useEffect(() => {
    if (!queued) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const shouldToggle = shouldToggleSampleOnSpace({
        key: event.key,
        hasQueued: true,
        isTyping: isTypingTarget(target),
        hasModal: Boolean(document.querySelector("[aria-modal='true']")),
        hasModifier: event.metaKey || event.ctrlKey || event.altKey,
        isOnButton: target instanceof HTMLElement && Boolean(target.closest("button")),
      });

      if (!shouldToggle) {
        return;
      }

      event.preventDefault();
      void togglePlayback();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [queued, togglePlayback]);

  async function hearTrack(key: string) {
    if (queued?.key === key) {
      await togglePlayback();
      return;
    }

    const cue = cues.find((entry) => entry.key === key);

    if (!cue) {
      return;
    }

    await startSample(cue);
  }

  function hearFollowing() {
    if (!queued) {
      setIsPlaying(false);
      setProgress(1);
      return;
    }

    const index = cues.findIndex((cue) => cue.key === queued.key);
    const following = index >= 0 ? cues[index + 1] : undefined;

    if (following) {
      void startSample(following);
      return;
    }

    setIsPlaying(false);
    setProgress(1);
  }

  function readAudioDuration(audio: HTMLAudioElement): number {
    return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
  }

  function seekToRatio(ratio: number) {
    const audio = audioRef.current;
    const seconds = sampleSeekSeconds({ ratio, duration: audio ? readAudioDuration(audio) : 0 });

    if (!audio || seconds === null) {
      return;
    }

    audio.currentTime = seconds;
    setProgress(ratio);
    setDuration(readAudioDuration(audio));
  }

  function seekFromClientX(clientX: number) {
    const bar = seekRef.current;

    if (!bar) {
      return;
    }

    const rect = bar.getBoundingClientRect();
    seekToRatio(sampleSeekRatio({ clientX, left: rect.left, width: rect.width }));
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        Hear a few seconds of this pressing.{" "}
        <span className="text-text-tertiary">30-second sample from Deezer</span>
      </p>

      <div className="flex flex-col gap-6">
        {sides.map((side, sideIndex) => (
          <div key={`${side.heading ?? "side"}-${sideIndex}`} className="flex flex-col gap-3">
            <RecordSideHeading side={side} showRuntime={sides.length > 1} />
            <ol className="flex flex-col" aria-label={side.heading ?? "Tracks"}>
              {side.tracks.map((track, trackIndex) => {
                const key = `${sideIndex}-${trackIndex}`;
                const isCurrent = queued?.key === key;

                return (
                  <li
                    key={`${track.position}-${track.title}-${trackIndex}`}
                    className="grid grid-cols-[2.75rem_2.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-subtle py-1 last:border-b-0"
                  >
                    {track.previewUrl ? (
                      <button
                        type="button"
                        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong ${
                          isCurrent
                            ? "bg-primary-soft text-on-primary-soft"
                            : "border border-border bg-surface text-text-secondary"
                        }`}
                        aria-label={
                          isCurrent && isPlaying
                            ? `Pause ${track.title}`
                            : `Hear a sample of ${track.title}`
                        }
                        aria-pressed={isCurrent && isPlaying}
                        onClick={() => {
                          void hearTrack(key);
                        }}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="size-4" aria-hidden />
                        ) : (
                          <Play className="size-4" aria-hidden />
                        )}
                      </button>
                    ) : (
                      <span className="size-11" aria-hidden />
                    )}
                    <span className="font-mono text-xs leading-5 text-text-tertiary">
                      {track.position || "·"}
                    </span>
                    <span className="text-sm leading-6 text-text">{track.title}</span>
                    <span className="font-mono text-xs leading-5 tabular-nums text-text-tertiary">
                      {track.duration ?? ""}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      {queued && nowPlaying ? (
        <div
          className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface/95 px-4 py-2 backdrop-blur-md lg:bottom-0 lg:left-60"
          role="region"
          aria-labelledby={headingId}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
            <div className="flex items-center gap-2">
              <CoverArt url={nowPlaying.artwork} alt="" sizes="44px" className="size-11 w-11 shrink-0" />
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong disabled:text-text-disabled"
                aria-label={previous ? `Hear a sample of ${previous.title}` : "No previous sample"}
                disabled={!canSkip}
                onClick={() => {
                  void hearCue(previous);
                }}
              >
                <SkipBack className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-border-strong"
                aria-label={isPlaying ? "Pause sample" : `Play ${sampleCueLabel(queued)}`}
                aria-pressed={isPlaying}
                onClick={() => {
                  void togglePlayback();
                }}
              >
                {isPlaying ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              </button>
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong disabled:text-text-disabled"
                aria-label={next ? `Hear a sample of ${next.title}` : "No next sample"}
                disabled={!canSkip}
                onClick={() => {
                  void hearCue(next);
                }}
              >
                <SkipForward className="size-4" aria-hidden />
              </button>
              <div className="min-w-0 flex-1">
                <p id={headingId} className="truncate text-sm leading-6 text-text">
                  {nowPlaying.title}
                </p>
                <p className="truncate text-xs leading-5 text-text-tertiary">
                  {nowPlaying.artist} · sample from Deezer
                </p>
              </div>
            </div>
            <div
              ref={seekRef}
              role="slider"
              tabIndex={0}
              aria-label="Sample position"
              aria-valuemin={0}
              aria-valuemax={duration > 0 ? Math.round(duration) : 0}
              aria-valuenow={duration > 0 ? Math.round(progress * duration) : 0}
              aria-valuetext={
                duration > 0
                  ? `${Math.round(progress * duration)} seconds into a ${Math.round(duration)}-second sample`
                  : "Sample position"
              }
              className="flex min-h-11 cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                seekFromClientX(event.clientX);
              }}
              onPointerMove={(event) => {
                if (event.buttons === 0) {
                  return;
                }

                seekFromClientX(event.clientX);
              }}
              onKeyDown={(event) => {
                if (event.key === "Home") {
                  event.preventDefault();
                  seekToRatio(0);
                  return;
                }

                if (event.key === "End") {
                  event.preventDefault();
                  seekToRatio(1);
                  return;
                }

                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                  return;
                }

                event.preventDefault();
                const audio = audioRef.current;
                const length = audio ? readAudioDuration(audio) : 0;

                if (length <= 0) {
                  return;
                }

                const delta = event.key === "ArrowRight" ? 2 : -2;
                const current = audio?.currentTime ?? 0;
                seekToRatio(sampleSeekRatio({ clientX: current + delta, left: 0, width: length }));
              }}
            >
              <div className="h-1 w-full overflow-hidden rounded-full bg-border-subtle" aria-hidden>
                <div className="h-full bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
            {error ? <Notice tone="error">{error}</Notice> : null}
          </div>
        </div>
      ) : null}

      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={hearFollowing}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          setDuration(audio ? readAudioDuration(audio) : 0);
        }}
        onTimeUpdate={() => {
          const audio = audioRef.current;

          if (!audio) {
            return;
          }

          const length = readAudioDuration(audio);
          setDuration(length);

          if (length <= 0) {
            return;
          }

          setProgress(audio.currentTime / length);
        }}
        onError={() => {
          setIsPlaying(false);
          setError("This sample could not be heard just now.");
        }}
      />
    </div>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName;

  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }

  if (target instanceof HTMLInputElement) {
    const type = target.type;
    return type !== "button" && type !== "submit" && type !== "checkbox" && type !== "radio" && type !== "file";
  }

  return false;
}

function sampleErrorMessage(cause: unknown): string {
  if (cause instanceof Error && cause.name === "NotAllowedError") {
    return "This sample could not start playing. Try again from the play button.";
  }

  return "This sample could not be heard just now.";
}
