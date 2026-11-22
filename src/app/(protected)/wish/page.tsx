
import type { Metadata } from "next";
import WishGarden from "@/components/wish/WishGarden";
import "./wish.css";

export const metadata: Metadata = {
  title: "Nana World",
  description:
    "Nine little worlds, nine beautiful wishes.",
};

export default function WishPage() {
  return <WishGarden />;
}
