
import type { Metadata } from "next";

import ClawMachine from "@/components/claw-machine/ClawMachine";

import "./claw-machine.css";

export const metadata: Metadata = {
  title: "Nana World",
  description:
    "A romantic 3D claw machine game filled with plushies and love.",
};

export default function ClawMachinePage() {
  return <ClawMachine />;
}
