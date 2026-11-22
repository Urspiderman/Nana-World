
import type { Metadata } from "next";
import PhotoBooth from "@/components/photobooth/PhotoBooth";
import "./photobooth.css";

export const metadata: Metadata = {
  title: "Nana World",
  description: "Create your little memories.",
};

export default function PhotoBoothPage() {
  return <PhotoBooth />;
}
