// src/components/service/OverlayCard.tsx
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import PerformanceCircle from "./PerformanceCircle";

interface OverlayCardProps {
  title: string;
  synthese: string;
  score?: number;
}

export default function OverlayCard({ title, synthese, score = 0 }: OverlayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="
        absolute inset-0
        flex flex-col justify-between
        p-4
        bg-gradient-to-t
          from-black/100   /* plus sombre en bas */
          via-black/20
          to-transparent
      "
    >
      {/* Like et Performance en haut à droite */}
      <div className="flex flex-col items-end gap-2">
        <span
          className="bg-white/90 p-2 rounded-full hover:bg-white transition w-8 h-8 flex items-center justify-center"
          aria-label="like"
        >
          <FaHeart className="text-red-500" />
        </span>
        <PerformanceCircle score={90} size={32} className="text-gray-400" />
      </div>

      {/* Titre + Synthèse en bas */}
      <div className="mt-auto">
        {synthese && (
          <p className="mt-1 text-white text-sm line-clamp-3">
            {synthese}
          </p>
        )}
      </div>
    </motion.div>
  );
}
