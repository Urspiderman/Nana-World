
import type { Metadata } from "next";
import LoveLibrary from "@/components/letters/LoveLibrary";
import "./letters.css";

export const metadata: Metadata = {
  title: "Nana World",
  description:
    "A little library filled with love letters, memories, and feelings written just for you.",
};

export default function LettersPage() {
  return <LoveLibrary />;
}
