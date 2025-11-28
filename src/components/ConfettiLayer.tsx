import React from "react";

const colors = [
  "#ffffff",
  "#f87171",
  "#4ade80",
  "#60a5fa",
  "#facc15",
  "#d2b371",
];

const ConfettiPiece: React.FC<{ index: number; side: "left" | "right" }> = ({
  index,
  side,
}) => {
  const color = colors[index % colors.length];
  const delay = (index % 5) * 0.6;
  const size = 6 + (index % 4) * 2;

  const horizontalPosition =
    side === "left" ? `${5 + (index % 4) * 3}%` : `${95 - (index % 4) * 3}%`;

  return (
    <div
      className="confetti-piece pointer-events-none absolute rounded-sm"
      style={{
        left: side === "left" ? horizontalPosition : undefined,
        right: side === "right" ? horizontalPosition : undefined,
        top: "-10%",
        width: `${size}px`,
        height: `${size * 1.8}px`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

const ConfettiLayer: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <ConfettiPiece key={`left-${i}`} index={i} side="left" />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <ConfettiPiece key={`right-${i}`} index={i + 7} side="right" />
      ))}
    </div>
  );
};

export default ConfettiLayer;
