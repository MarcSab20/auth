"use client";
import React, { useRef } from "react";

interface ResponsiveCarouselProps {
  children: React.ReactNode[];
  noPadding?: boolean;
}

const ResponsiveCarousel: React.FC<ResponsiveCarouselProps> = ({ children, noPadding }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const childCount = React.Children.count(children);

  // Fonction pour créer une div transparente de la même taille qu'une image
  const createTransparentDiv = (key: string) => (
    <div key={key} className="shrink-0 overflow-visible">
      <div className="w-[550px] h-[350px] opacity-0 pointer-events-none" />
    </div>
  );

  // Fonction pour générer le contenu avec les divs transparentes
  const getDesktopContent = () => {
    const content = React.Children.map(children, (child, idx) => (
      <div key={`child-${idx}`} className="shrink-0 overflow-visible">{child}</div>
    ));

    if (childCount === 1) {
      // 1 image: div transparente + image + div transparente
      return [
        createTransparentDiv("transparent-left"),
        ...(content || []),
        createTransparentDiv("transparent-right")
      ];
    } else if (childCount === 2) {
      // 2 images: image + image + div transparente
      return [
        ...(content || []),
        createTransparentDiv("transparent-right")
      ];
    } else {
      // 3+ images: comportement normal
      return content || [];
    }
  };

  return (
    <div className="w-full">
      {/* Version Desktop */}
      <div className="hidden lg:block relative">
        {childCount > 3 && (
          <>
            <a
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white shadow px-2 py-1 rounded-l"
            >
              ◀
            </a>
            <a
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white shadow px-2 py-1 rounded-r"
            >
              ▶
            </a>
          </>
        )}
        <div
          ref={scrollContainerRef}
          className={`flex gap-12 overflow-x-auto ${noPadding ? 'px-0' : 'px-8'} scrollbar-hide scroll-smooth`}
        >
          {getDesktopContent()}
        </div>
      </div>

      {/* Version Mobile/Tablette */}
      <div className="block lg:hidden">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 scrollbar-hide">
          {React.Children.map(children, (child, idx) => (
            <div key={idx} className="snap-center shrink-0 w-full overflow-visible">
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  ); 
};

export default ResponsiveCarousel;
