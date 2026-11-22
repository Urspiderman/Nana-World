
"use client";
import { normalizeImageFile } from "@/lib/photobooth/normalize-image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  Camera,
  CameraOff,
  Check,
  Download,
  Heart,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  SwitchCamera,
} from "lucide-react";

import {
  FRAMES,
  FRAME_WIDTH,
  FRAME_HEIGHT,
  type PhotoFrame,
} from "./frame-config";


const PHOTO_COUNT = 4;
const MAX_ZOOM = 5;

type Transform = {
  zoom: number;
  x: number;
  y: number;
};

type FacingMode = "user" | "environment";

type CameraStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

type Point = {
  x: number;
  y: number;
};

type Gesture = {
  pointers: Map<number, Point>;
  start: Transform;
  center: Point;
  distance: number;
};

const FILTERS = [
  {
    id: "original",
    label: "Original",
    css: "none",
  },
  {
    id: "soft",
    label: "Soft Pink",
    css: "brightness(1.06) saturate(.9) sepia(.12)",
  },
  {
    id: "vintage",
    label: "Vintage",
    css: "sepia(.35) contrast(.94) saturate(.85)",
  },
  {
    id: "bw",
    label: "B&W",
    css: "grayscale(1) contrast(1.08)",
  },
] as const;

const DEFAULT_TRANSFORM: Transform = {
  zoom: 1,
  x: 0,
  y: 0,
};

function createTransforms(): Transform[] {
  return Array.from(
    { length: PHOTO_COUNT },
    () => ({ ...DEFAULT_TRANSFORM })
  );
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(max, Math.max(min, value));
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () =>
      reject(new Error(`Failed to load: ${src}`));

    image.src = src;
  });
}

function getSlot(
  frame: PhotoFrame,
  index: number
) {
  const [x, y, w, h] = frame.slots[index];

  return { x, y, w, h };
}

function getImageSize(
  image: HTMLImageElement,
  width: number,
  height: number,
  zoom: number
) {
  const scale =
    Math.max(
      width / image.naturalWidth,
      height / image.naturalHeight
    ) * zoom;

  return {
    width: image.naturalWidth * scale,
    height: image.naturalHeight * scale,
  };
}

function constrainTransform(
  transform: Transform,
  image: HTMLImageElement,
  width: number,
  height: number
): Transform {
  const zoom = clamp(
    transform.zoom,
    1,
    MAX_ZOOM
  );

  const size = getImageSize(
    image,
    width,
    height,
    zoom
  );

  const maxX = Math.max(
    0,
    (size.width - width) / (2 * width)
  );

  const maxY = Math.max(
    0,
    (size.height - height) / (2 * height)
  );

  return {
    zoom,
    x: clamp(transform.x, -maxX, maxX),
    y: clamp(transform.y, -maxY, maxY),
  };
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
  transform: Transform,
  filter: string
) {
  const t = constrainTransform(
    transform,
    image,
    rect.w,
    rect.h
  );

  const size = getImageSize(
    image,
    rect.w,
    rect.h,
    t.zoom
  );

  ctx.save();

  ctx.beginPath();
  ctx.rect(
    rect.x,
    rect.y,
    rect.w,
    rect.h
  );
  ctx.clip();

  ctx.filter = filter;

  ctx.drawImage(
    image,
    rect.x +
      (rect.w - size.width) / 2 +
      t.x * rect.w,
    rect.y +
      (rect.h - size.height) / 2 +
      t.y * rect.h,
    size.width,
    size.height
  );

  ctx.restore();
}

function drawVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  mirror: boolean
) {
  const sw = video.videoWidth;
  const sh = video.videoHeight;

  const dw = ctx.canvas.width;
  const dh = ctx.canvas.height;

  const scale = Math.max(
    dw / sw,
    dh / sh
  );

  const cropW = dw / scale;
  const cropH = dh / scale;

  ctx.save();

  if (mirror) {
    ctx.translate(dw, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    video,
    (sw - cropW) / 2,
    (sh - cropH) / 2,
    cropW,
    cropH,
    0,
    0,
    dw,
    dh
  );

  ctx.restore();
}

async function drawPhotostrip(
  canvas: HTMLCanvasElement,
  photos: string[],
  transforms: Transform[],
  frame: PhotoFrame,
  filter: string
) {
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas unavailable");
  }

  const [frameImage, images] =
    await Promise.all([
      loadImage(frame.src),
      Promise.all(photos.map(loadImage)),
    ]);

  ctx.clearRect(
    0,
    0,
    FRAME_WIDTH,
    FRAME_HEIGHT
  );

  // Foto selalu berada di belakang frame.
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const slot = getSlot(frame, i);
    const image = images[i];

    if (image) {
      drawPhoto(
        ctx,
        image,
        slot,
        transforms[i] ??
          DEFAULT_TRANSFORM,
        filter
      );
    } else {
      ctx.fillStyle = "#f5e1e9";

      ctx.fillRect(
        slot.x,
        slot.y,
        slot.w,
        slot.h
      );
    }
  }

  // Overlay PNG asli.
  ctx.drawImage(
    frameImage,
    0,
    0,
    FRAME_WIDTH,
    FRAME_HEIGHT
  );
}

export default function PhotoBooth() {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const editorRef =
    useRef<HTMLCanvasElement>(null);

  const previewRef =
    useRef<HTMLCanvasElement>(null);

  const uploadRef =
    useRef<HTMLInputElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const mountedRef = useRef(false);

  const cameraRequestRef = useRef(0);
  const captureRequestRef = useRef(0);
  const uploadRequestRef = useRef(0);

  const capturingRef = useRef(false);

  const gestureRef =
    useRef<Gesture | null>(null);

  const imageCacheRef = useRef(
    new Map<string, HTMLImageElement>()
  );

  const [cameraStatus, setCameraStatus] =
    useState<CameraStatus>("idle");

  const [facing, setFacing] =
    useState<FacingMode>("user");

  const [error, setError] =
    useState("");

  const [photos, setPhotos] =
    useState<string[]>([]);

  const [transforms, setTransforms] =
    useState<Transform[]>(
      createTransforms
    );

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState(0);

  const [frameId, setFrameId] =
    useState(FRAMES[0].id);

  const [filterId, setFilterId] =
    useState("original");

  const [capturing, setCapturing] =
    useState(false);

  const [countdown, setCountdown] =
    useState<number | null>(null);

  const [rendering, setRendering] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const frame =
    FRAMES.find(
      (item) => item.id === frameId
    ) ?? FRAMES[0];

  const filter =
    FILTERS.find(
      (item) => item.id === filterId
    ) ?? FILTERS[0];

  const activeTransform =
    transforms[selectedPhoto] ??
    DEFAULT_TRANSFORM;

  const activeSlot = getSlot(
    frame,
    selectedPhoto
  );

  const isComplete =
    photos.length === PHOTO_COUNT;

  // ======================================
  // CAMERA
  // ======================================

  const stopTracks = useCallback(() => {
    streamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const closeCamera = useCallback(() => {
    cameraRequestRef.current++;
    captureRequestRef.current++;

    capturingRef.current = false;

    stopTracks();

    setCameraStatus("idle");
    setCapturing(false);
    setCountdown(null);
  }, [stopTracks]);

  const openCamera = useCallback(
    async (mode: FacingMode) => {
      const request =
        ++cameraRequestRef.current;

      stopTracks();

      setCameraStatus("loading");
      setError("");

      if (
        !window.isSecureContext ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setCameraStatus("error");

        setError(
          "Kamera membutuhkan HTTPS atau localhost."
        );

        return;
      }

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: {
                ideal: mode,
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
          });

        if (
          !mountedRef.current ||
          request !==
            cameraRequestRef.current
        ) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        const video = videoRef.current;

        if (!video) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          throw new Error(
            "Video element unavailable"
          );
        }

        streamRef.current = stream;
        video.srcObject = stream;

        await video.play();

        if (
          mountedRef.current &&
          request ===
            cameraRequestRef.current
        ) {
          setCameraStatus("ready");
        }
      } catch (err) {
        if (
          request !==
          cameraRequestRef.current
        ) {
          return;
        }

        stopTracks();

        setCameraStatus("error");

        const name =
          err instanceof DOMException
            ? err.name
            : "";

        setError(
          name === "NotAllowedError"
            ? "Izin kamera ditolak. Aktifkan izin kamera di browser."
            : name === "NotFoundError"
              ? "Kamera tidak ditemukan."
              : name === "NotReadableError"
                ? "Kamera sedang digunakan aplikasi lain."
                : "Gagal membuka kamera. Coba lagi atau upload foto."
        );
      }
    },
    [stopTracks]
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      cameraRequestRef.current++;
      captureRequestRef.current++;
      uploadRequestRef.current++;

      streamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        );
    };
  }, []);

  const switchCamera = () => {
    if (capturingRef.current) {
      return;
    }

    const next: FacingMode =
      facing === "user"
        ? "environment"
        : "user";

    setFacing(next);

    void openCamera(next);
  };

  const takePhoto = useCallback(() => {
    const video = videoRef.current;

    if (
      !video ||
      video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      throw new Error(
        "Camera is not ready"
      );
    }

    const canvas =
      document.createElement("canvas");

    canvas.width = 900;
    canvas.height = 600;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Canvas unavailable"
      );
    }

    drawVideo(
      ctx,
      video,
      facing === "user"
    );

    return canvas.toDataURL(
      "image/jpeg",
      0.92
    );
  }, [facing]);

  const captureFour = async () => {
    if (
      capturingRef.current ||
      cameraStatus !== "ready"
    ) {
      return;
    }

    capturingRef.current = true;

    const request =
      ++captureRequestRef.current;

    ++uploadRequestRef.current;

    setCapturing(true);
    setError("");
    setPhotos([]);
    setSelectedPhoto(0);
    setTransforms(createTransforms());

    const results: string[] = [];

    try {
      for (
        let i = 0;
        i < PHOTO_COUNT;
        i++
      ) {
        for (
          let second = 3;
          second >= 1;
          second--
        ) {
          if (
            request !==
            captureRequestRef.current
          ) {
            return;
          }

          setCountdown(second);
          await sleep(1000);
        }

        if (
          request !==
          captureRequestRef.current
        ) {
          return;
        }

        setCountdown(null);

        results.push(
          takePhoto()
        );

        setPhotos([...results]);

        await sleep(350);
      }
    } catch {
      if (
        request ===
        captureRequestRef.current
      ) {
        setError(
          "Gagal mengambil foto. Coba ulangi."
        );
      }
    } finally {
      if (
        request ===
        captureRequestRef.current
      ) {
        capturingRef.current = false;
        setCapturing(false);
        setCountdown(null);
      }
    }
  };

  // ======================================
  // UPLOAD
  // ======================================

  const uploadPhotos = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (!files.length || capturingRef.current) {
      return;
    }

    const request = ++uploadRequestRef.current;

    setError("");

    try {
      const result = await Promise.all(
        files.slice(0, PHOTO_COUNT).map(async (file) => {
          const normalizedFile =
            await normalizeImageFile(file);

          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
              if (typeof reader.result === "string") {
                resolve(reader.result);
              } else {
                reject(new Error("Invalid image data"));
              }
            };

            reader.onerror = () => {
              reject(new Error("Failed to read image"));
            };

            reader.readAsDataURL(normalizedFile);
          });
        })
      );

      if (
        !mountedRef.current ||
        request !== uploadRequestRef.current
      ) {
        return;
      }

      setPhotos(result);
      setSelectedPhoto(0);
      setTransforms(createTransforms());
    } catch (error) {
      console.error("Photo upload failed:", error);

      if (
        mountedRef.current &&
        request === uploadRequestRef.current
      ) {
        setError(
          "Gagal membaca foto. Gunakan JPG, PNG, WEBP, HEIC, atau HEIF."
        );
      }
    }
  };
  const resetPhotos = () => {
    if (capturingRef.current) {
      return;
    }

    captureRequestRef.current++;
    uploadRequestRef.current++;

    setPhotos([]);
    setSelectedPhoto(0);
    setTransforms(createTransforms());

    imageCacheRef.current.clear();

    setError("");
  };

  // ======================================
  // PHOTO CACHE
  // ======================================

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      photos.map(async (src) => {
        const image =
          await loadImage(src);

        return [
          src,
          image,
        ] as const;
      })
    )
      .then((entries) => {
        if (cancelled) return;

        imageCacheRef.current =
          new Map(entries);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Gagal memuat foto."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [photos]);

  const updateTransform = useCallback(
    (
      index: number,
      next: Transform
    ) => {
      setTransforms((previous) => {
        const image =
          imageCacheRef.current.get(
            photos[index]
          );

        const slot =
          getSlot(frame, index);

        const corrected = image
          ? constrainTransform(
              next,
              image,
              slot.w,
              slot.h
            )
          : {
              ...next,
              zoom: clamp(
                next.zoom,
                1,
                MAX_ZOOM
              ),
            };

        return previous.map(
          (item, i) =>
            i === index
              ? corrected
              : item
        );
      });
    },
    [photos, frame]
  );

  // ======================================
  // EDITOR CANVAS
  // ======================================

  useEffect(() => {
    const canvas =
      editorRef.current;

    if (!canvas) return;

    canvas.width =
      Math.round(activeSlot.w);

    canvas.height =
      Math.round(activeSlot.h);

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    ctx.fillStyle = "#f4dfe7";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const src =
      photos[selectedPhoto];

    if (!src) return;

    let cancelled = false;

    loadImage(src)
      .then((image) => {
        if (cancelled) return;

        drawPhoto(
          ctx,
          image,
          {
            x: 0,
            y: 0,
            w: canvas.width,
            h: canvas.height,
          },
          activeTransform,
          filter.css
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [
    photos,
    selectedPhoto,
    activeTransform,
    activeSlot.w,
    activeSlot.h,
    filter.css,
  ]);

  // ======================================
  // PHOTOSTRIP PREVIEW
  // ======================================

  useEffect(() => {
    const canvas =
      previewRef.current;

    if (!canvas) return;

    let cancelled = false;

    const temporary =
      document.createElement("canvas");

    setRendering(true);

    drawPhotostrip(
      temporary,
      photos,
      transforms,
      frame,
      filter.css
    )
      .then(() => {
        if (cancelled) return;

        canvas.width =
          FRAME_WIDTH;

        canvas.height =
          FRAME_HEIGHT;

        canvas
          .getContext("2d")
          ?.drawImage(
            temporary,
            0,
            0
          );
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Gagal memuat frame atau foto."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRendering(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    photos,
    transforms,
    frame,
    filter.css,
  ]);

  // ======================================
  // DRAG & PINCH ZOOM
  // ======================================

  const pointerDown = (
    event: ReactPointerEvent<HTMLCanvasElement>
  ) => {
    if (!photos[selectedPhoto]) {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    const rect =
      event.currentTarget.getBoundingClientRect();

    const point = {
      x:
        (event.clientX - rect.left) /
        rect.width,
      y:
        (event.clientY - rect.top) /
        rect.height,
    };

    if (!gestureRef.current) {
      gestureRef.current = {
        pointers: new Map(),
        start: {
          ...activeTransform,
        },
        center: point,
        distance: 0,
      };
    }

    const gesture =
      gestureRef.current;

    gesture.pointers.set(
      event.pointerId,
      point
    );

    if (
      gesture.pointers.size === 2
    ) {
      const [a, b] = [
        ...gesture.pointers.values(),
      ];

      gesture.start = {
        ...activeTransform,
      };

      gesture.center = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      };

      gesture.distance =
        Math.hypot(
          a.x - b.x,
          a.y - b.y
        );
    }
  };

  const pointerMove = (
    event: ReactPointerEvent<HTMLCanvasElement>
  ) => {
    const gesture =
      gestureRef.current;

    if (
      !gesture?.pointers.has(
        event.pointerId
      )
    ) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const point = {
      x:
        (event.clientX - rect.left) /
        rect.width,
      y:
        (event.clientY - rect.top) /
        rect.height,
    };

    gesture.pointers.set(
      event.pointerId,
      point
    );

    const points = [
      ...gesture.pointers.values(),
    ];

    if (points.length === 1) {
      updateTransform(
        selectedPhoto,
        {
          ...gesture.start,
          x:
            gesture.start.x +
            point.x -
            gesture.center.x,
          y:
            gesture.start.y +
            point.y -
            gesture.center.y,
        }
      );
    } else if (
      points.length === 2
    ) {
      const [a, b] = points;

      const center = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      };

      const distance =
        Math.hypot(
          a.x - b.x,
          a.y - b.y
        );

      updateTransform(
        selectedPhoto,
        {
          zoom:
            gesture.start.zoom *
            (
              distance /
              Math.max(
                gesture.distance,
                0.001
              )
            ),
          x:
            gesture.start.x +
            center.x -
            gesture.center.x,
          y:
            gesture.start.y +
            center.y -
            gesture.center.y,
        }
      );
    }
  };

  const pointerUp = (
    event: ReactPointerEvent<HTMLCanvasElement>
  ) => {
    const gesture =
      gestureRef.current;

    if (!gesture) return;

    gesture.pointers.delete(
      event.pointerId
    );

    if (
      !gesture.pointers.size
    ) {
      gestureRef.current = null;
      return;
    }

    const remaining = [
      ...gesture.pointers.values(),
    ][0];

    gesture.start =
      transforms[selectedPhoto] ??
      DEFAULT_TRANSFORM;

    gesture.center = remaining;
    gesture.distance = 0;
  };

  // ======================================
  // DOWNLOAD
  // ======================================

  const download = async () => {
    if (
      !isComplete ||
      rendering ||
      downloading
    ) {
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const canvas =
        document.createElement("canvas");

      await drawPhotostrip(
        canvas,
        photos,
        transforms,
        frame,
        filter.css
      );

      const blob =
        await new Promise<Blob | null>(
          (resolve) => {
            canvas.toBlob(
              resolve,
              "image/png"
            );
          }
        );

      if (!blob) {
        throw new Error(
          "Export failed"
        );
      }

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `nana-${frame.id}-${Date.now()}.png`;

      document.body.appendChild(link);

      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
    } catch {
      setError(
        "Gagal mengunduh photostrip."
      );
    } finally {
      setDownloading(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <main className="nana-booth">
      <div
        className="nana-booth-background"
        aria-hidden="true"
      />

      <div className="nana-container">
        <div className="nana-layout">

          {/* CAPTURE CARD */}
          <section className="nana-card">
            <div className="nana-card-header">
              <span className="nana-eyebrow">
                01 · CAPTURE
              </span>

              <h2>Say cheese! ♡</h2>
            </div>

            <div className="nana-camera">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={
                  facing === "user"
                    ? "mirror"
                    : ""
                }
                style={{
                  visibility:
                    cameraStatus === "ready"
                      ? "visible"
                      : "hidden",
                }}
              />

              {cameraStatus !== "ready" && (
                <div className="nana-camera-placeholder">
                  <div className="nana-placeholder-icon">
                    <Heart
                      size={48}
                      strokeWidth={1.7}
                    />
                  </div>

                  <strong>
                    Ready for your close-up?
                  </strong>

                  <p>
                    Open camera or upload photos
                  </p>
                </div>
              )}

              {countdown !== null && (
                <div className="nana-countdown">
                  {countdown}
                </div>
              )}

              {capturing && (
                <div className="nana-shot-counter">
                  Shot{" "}
                  {Math.min(
                    photos.length + 1,
                    PHOTO_COUNT
                  )}
                  /{PHOTO_COUNT}
                </div>
              )}
            </div>

            <div className="nana-camera-actions">
              {cameraStatus === "ready" ? (
                <>
                  <button
                    type="button"
                    className="nana-btn nana-btn-primary"
                    disabled={capturing}
                    onClick={captureFour}
                  >
                    <Camera size={16} />

                    {capturing
                      ? "Capturing..."
                      : "Take 4 Photos"}
                  </button>

                  <button
                    type="button"
                    className="nana-btn nana-btn-icon"
                    disabled={capturing}
                    onClick={switchCamera}
                    aria-label="Switch camera"
                    title="Switch camera"
                  >
                    <SwitchCamera size={19} />
                  </button>

                  <button
                    type="button"
                    className="nana-btn nana-btn-icon"
                    disabled={capturing}
                    onClick={closeCamera}
                    aria-label="Close camera"
                    title="Close camera"
                  >
                    <CameraOff size={19} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="nana-btn nana-btn-primary"
                  disabled={
                    cameraStatus === "loading"
                  }
                  onClick={() =>
                    void openCamera(facing)
                  }
                >
                  {cameraStatus === "loading" ? (
                    <LoaderCircle
                      size={16}
                      className="nana-spin"
                    />
                  ) : (
                    <Camera size={16} />
                  )}

                  {cameraStatus === "loading"
                    ? "Opening..."
                    : "Open Camera"}
                </button>
              )}

              <button
                type="button"
                className="nana-btn nana-btn-secondary"
                disabled={capturing}
                onClick={() =>
                  uploadRef.current?.click()
                }
              >
                <ImagePlus size={16} />
                Upload Photos
              </button>

              <input
                ref={uploadRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                multiple
                hidden
                onChange={uploadPhotos}
              />
            </div>

            <div className="nana-thumbnails">
              {Array.from(
                { length: PHOTO_COUNT },
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={
                      selectedPhoto === index
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedPhoto(index)
                    }
                    aria-label={
                      `Edit photo ${index + 1}`
                    }
                  >
                    {photos[index] ? (
                      <img
                        src={photos[index]}
                        alt={
                          `Photo ${index + 1}`
                        }
                      />
                    ) : (
                      <span>
                        {index + 1}
                      </span>
                    )}
                  </button>
                )
              )}
            </div>

            <div className="nana-capture-footer">
              <span>
                {photos.length}/{PHOTO_COUNT} photos
              </span>

              <button
                type="button"
                disabled={
                  capturing ||
                  photos.length === 0
                }
                onClick={resetPhotos}
              >
                <RotateCcw size={13} />
                Retake all
              </button>
            </div>

            <div className="nana-card-spacer" />
          </section>

          {/* EDIT CARD */}
          <section className="nana-card">
            <div className="nana-card-header">
              <span className="nana-eyebrow">
                02 · EDIT
              </span>

              <h2>Make it yours</h2>
            </div>

            <div className="nana-section">
              <h3>
                Choose your frame
              </h3>

              <div className="nana-frame-grid">
                {FRAMES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      frameId === item.id
                        ? "selected"
                        : ""
                    }
                    aria-pressed={
                      frameId === item.id
                    }
                    onClick={() => {
                      gestureRef.current = null;
                      setFrameId(item.id);
                    }}
                  >
                    <img
                      src={item.src}
                      alt=""
                    />

                    <span>
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="nana-section">
              <div className="nana-section-heading">
                <h3>
                  Adjust photo{" "}
                  {selectedPhoto + 1}
                </h3>

                <span>
                  Drag & zoom
                </span>
              </div>

              <div
                className="nana-editor"
                style={{
                  aspectRatio:
                    `${activeSlot.w} / ${activeSlot.h}`,
                }}
              >
                <canvas
                  ref={editorRef}
                  onPointerDown={pointerDown}
                  onPointerMove={pointerMove}
                  onPointerUp={pointerUp}
                  onPointerCancel={pointerUp}
                  aria-label={
                    `Edit photo ${selectedPhoto + 1}`
                  }
                />

                {!photos[selectedPhoto] && (
                  <div className="nana-editor-placeholder">
                    <Sparkles size={24} />

                    <span>
                      Add a photo to start editing
                    </span>
                  </div>
                )}
              </div>

              <div className="nana-photo-tabs">
                {Array.from(
                  {
                    length: PHOTO_COUNT,
                  },
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={
                        selectedPhoto === index
                          ? "selected"
                          : ""
                      }
                      onClick={() => {
                        gestureRef.current = null;
                        setSelectedPhoto(index);
                      }}
                    >
                      Photo {index + 1}
                    </button>
                  )
                )}
              </div>

              <div className="nana-zoom">
                <div className="nana-zoom-label">
                  <span>Zoom</span>

                  <strong>
                    {activeTransform.zoom.toFixed(1)}×
                  </strong>
                </div>

                <div className="nana-zoom-controls">
                  <button
                    type="button"
                    disabled={
                      !photos[selectedPhoto]
                    }
                    aria-label="Zoom out"
                    onClick={() =>
                      updateTransform(
                        selectedPhoto,
                        {
                          ...activeTransform,
                          zoom:
                            activeTransform.zoom -
                            0.1,
                        }
                      )
                    }
                  >
                    −
                  </button>

                  <input
                    type="range"
                    min={1}
                    max={MAX_ZOOM}
                    step={0.05}
                    value={
                      activeTransform.zoom
                    }
                    disabled={
                      !photos[selectedPhoto]
                    }
                    aria-label="Photo zoom"
                    onChange={(event) =>
                      updateTransform(
                        selectedPhoto,
                        {
                          ...activeTransform,
                          zoom: Number(
                            event.target.value
                          ),
                        }
                      )
                    }
                  />

                  <button
                    type="button"
                    disabled={
                      !photos[selectedPhoto]
                    }
                    aria-label="Zoom in"
                    onClick={() =>
                      updateTransform(
                        selectedPhoto,
                        {
                          ...activeTransform,
                          zoom:
                            activeTransform.zoom +
                            0.1,
                        }
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="nana-section">
              <h3>
                Photo filter
              </h3>

              <div className="nana-filter-grid">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      filterId === item.id
                        ? "selected"
                        : ""
                    }
                    aria-pressed={
                      filterId === item.id
                    }
                    onClick={() =>
                      setFilterId(item.id)
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="nana-editor-tip">
              <Heart size={15} />

              <span>
                Drag your photo to adjust it.
                Pinch with two fingers to zoom.
              </span>
            </div>
          </section>

          {/* PREVIEW CARD */}
          <section className="nana-card">
            <div className="nana-card-header">
              <span className="nana-eyebrow">
                03 · KEEP
              </span>

              <h2>
                Your photostrip
              </h2>
            </div>

            <div className="nana-preview-stage">
              <canvas
                ref={previewRef}
                className="nana-photostrip"
                role="img"
                aria-label="Photostrip preview"
              />
            </div>

            <button
              type="button"
              className="nana-btn nana-btn-primary nana-download"
              disabled={
                !isComplete ||
                rendering ||
                downloading
              }
              onClick={download}
            >
              {downloading ? (
                <LoaderCircle
                  size={17}
                  className="nana-spin"
                />
              ) : (
                <Download size={17} />
              )}

              {downloading
                ? "Preparing PNG..."
                : "Download Photostrip"}
            </button>

            <div className="nana-result-message">
              {isComplete ? (
                <>
                  <Check size={14} />
                  Your memory is ready ♡
                </>
              ) : (
                <>
                  <Heart size={14} />
                  Complete four photos
                </>
              )}
            </div>

            <div className="nana-card-spacer" />
          </section>
        </div>

        {error && (
          <div
            className="nana-error"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
