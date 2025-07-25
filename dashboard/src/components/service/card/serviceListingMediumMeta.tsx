// src/components/service/SMPServiceListingMediumMeta.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import ServiceRadarChart, { SERVICE_CRITERIA, Criterion } from "./ServiceRadarChart";
import { FaEye, FaHeart, FaCommentDots } from "react-icons/fa";

interface SMPServiceListingMediumMetaProps {
  views?: number;
  likes?: number;
  comments?: number;
}

const CLOSE_DELAY = 1000; // ms

// Fisher–Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SMPServiceListingMediumMeta: React.FC<SMPServiceListingMediumMetaProps> = ({
  views = 0,
  likes = 0,
  comments = 0,
}) => {
  // Mélange unique à l'initialisation
  const randomizedCriteria: Criterion[] = useMemo(
    () => shuffle(SERVICE_CRITERIA),
    []
  );

  const [isOpen, setIsOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const crit = randomizedCriteria[idx];

  const prev = () =>
    setIdx((i) => (i - 1 + randomizedCriteria.length) % randomizedCriteria.length);
  const next = () =>
    setIdx((i) => (i + 1) % randomizedCriteria.length);

  // Démarre le timer de fermeture
  const startCloseTimer = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY);
  };
  // Annule la fermeture
  const clearCloseTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Cleanup on unmount
  useEffect(() => () => clearCloseTimer(), []);

  return (
    <div
      ref={wrapperRef}
      className="flex items-center justify-between w-full gap-2 mt-2 relative"
      onMouseLeave={startCloseTimer}
      onMouseEnter={clearCloseTimer}
    >
      {/* Mini radar clickable */}
      <div
        className="cursor-pointer"
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        onMouseEnter={() => setIsOpen(true)}
      >
        <ServiceRadarChart
          data={randomizedCriteria}
          size={50}
          hideLabels
          color="black"
        />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="
            absolute z-30 left-0 bottom-20
            w-[440px] h-[340px] max-w-full
            bg-white rounded-b-xl rounded-tl-xl
             flex flex-col animate-fade-in
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation */}
          <div className="flex items-center gap-4  mt-4 justify-center">
            <div className="w-[250px] h-[250px]">
              <ServiceRadarChart
                data={randomizedCriteria}
                size={220}
              />
            </div>
            {/* <button onClick={next} className="p-2 hover:bg-gray-200 rounded">→</button> */}
          </div>

      
        </div>
      )}

      {/* Stats simples */}
      <div className="flex items-center gap-4 text-gray-500 text-sm">
        <span className="flex items-center gap-1">
          <FaHeart className="text-red-400" /> {likes}
        </span>
        <span className="flex items-center gap-1">
          <FaEye /> {views}
        </span>
        <span className="flex items-center gap-1">
          <FaCommentDots /> {comments}
        </span>
      </div>
    </div>
  );
};

export default SMPServiceListingMediumMeta;
