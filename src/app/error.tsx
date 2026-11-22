"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-serif text-3xl text-[#852E43]">
        Something went wrong ♡
      </h1>

      <button
        onClick={reset}
        className="rounded-full bg-[#852E43] px-6 py-3 text-white"
      >
        Try Again
      </button>
    </main>
  );
}