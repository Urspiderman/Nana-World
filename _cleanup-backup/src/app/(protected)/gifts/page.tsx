import Link from "next/link";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFF4F5] px-6 text-center">
      <p className="mb-5 text-xs tracking-[0.25em] text-[#B77A8A]">
        NANA WORLD
      </p>

      <h1 className="font-serif text-5xl text-[#852E43]">
        Secret Gifts ♡
      </h1>

      <p className="mt-5 max-w-md text-[#97717B]">
        A little something special is coming soon.
      </p>

      <Link
        href="/"
        className="mt-9 rounded-full bg-[#852E43] px-8 py-4 text-white"
      >
        Back to Our World
      </Link>
    </main>
  );
}

