
import { Gift, Heart, Sparkles } from "lucide-react";
import "../../app/(protected)/section-divider.css";

type SectionDividerProps = {
  variant?: "chapter" | "letter" | "finale";
};

const dividerConfig = {
  chapter: {
    label: "A NEW CHAPTER BEGINS",
    Icon: Sparkles,
  },
  letter: {
    label: "A LITTLE NOTE FROM ME TO YOU",
    Icon: Heart,
  },
  finale: {
    label: "ONE LAST LITTLE SURPRISE",
    Icon: Gift,
  },
};

export default function SectionDivider({
  variant = "chapter",
}: SectionDividerProps) {
  const { label, Icon } = dividerConfig[variant];

  return (
    <div
      className={`sw-chapter-divider sw-chapter-divider-${variant}`}
      role="separator"
      aria-label={label}
    >
      <div
        className="sw-chapter-divider-line"
        aria-hidden="true"
      />

      <div className="sw-chapter-badge">
        <Icon size={15} strokeWidth={1.7} />
        <span>{label}</span>
        <Icon size={15} strokeWidth={1.7} />
      </div>
    </div>
  );
}
