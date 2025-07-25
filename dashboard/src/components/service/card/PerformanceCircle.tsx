import React from "react";

interface PerformanceCircleProps {
  score: number | 50; // 0-100
  size?: number;
  className?: string;
}

const PerformanceCircle: React.FC<PerformanceCircleProps> = ({ score, size = 80, className = "" }) => {
  // Couleur dynamique selon la note
  const color = score > 80 ? "#4ade80" : score > 60 ? "#facc15" : "#f87171";
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.4,
        color: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {score}
    </div>
  );
};

export default PerformanceCircle; 