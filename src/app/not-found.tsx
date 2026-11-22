
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8F4] px-6">
      <div className="max-w-lg text-center">

        <p className="mb-5 text-sm tracking-[0.3em] text-[#B77A8A]">
          NANA WORLD
        </p>

        <h1 className="font-serif text-8xl text-[#852E43]">
          404
        </h1>

        <h2 className="mt-6 font-serif text-3xl text-[#852E43]">
          Oops, You're Lost ♡
        </h2>

        <p className="mt-5 leading-relaxed text-[#97717B]">
          Looks like this little page doesn't exist.
          Don't worry, there's still so much love
          waiting for you.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#852E43] px-8 py-4 text-white transition hover:bg-[#6D2236]"
        >
          <ArrowLeft size={18} />
          Back to Our World
          <Heart size={16} />
        </Link>

        <p className="mt-12 text-sm text-[#B58D97]">
          Made with love, just for you ♡
        </p>

      </div>
    </main>
  );
}

