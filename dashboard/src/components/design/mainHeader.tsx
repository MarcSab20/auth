import { useEffect, useState, useRef } from "react";
import HeaderUtils from "./header/headerUtils";
import { useSearch } from "@/context/searchContext";
import { TopicsBar } from "@/src/components/design/TopicsBar";
import type { Topic } from "@/src/components/design/TopicsBar";

export default function SMPMainHeader() {
  const [shrinkHeader, setShrinkHeader] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { searchTerm, setSearchTerm } = useSearch();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setSearchTerm(tag);
    setIsSearchActive(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    const scrollHandler = () => setShrinkHeader(window.pageYOffset > 100);
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        shrinkHeader ? "mt-10 h-16" : "mt-0 h-24 sm:h-28"
      }`}
    >
      <div
        className={`relative z-40 transition-all duration-300 ${
          shrinkHeader
            ? "w-full max-w-6xl mx-auto bg-white rounded-full"
            : "w-full bg-white"
        } px-4 sm:px-6 backdrop-blur-sm`}
      >
        <div
          className={`relative flex items-center justify-between gap-3 px-3 transition-all duration-300 ${
            isSearchActive ? "h-20" : "h-14 sm:h-16"
          }`}
        >
          <HeaderUtils
            toggleMenu={() => setMenuOpen((prev) => !prev)}
            menuOpen={menuOpen}
            isSearchActive={isSearchActive}
            onFocus={() => setIsSearchActive(true)}
            onBlur={() => setIsSearchActive(false)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchInputRef={searchInputRef}
          />
        </div>
      </div>
      {!shrinkHeader && !isSearchActive && (
        <div className="relative z-30">
          <TopicsBar
            shrinkHeader={shrinkHeader}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            onSelectTag={handleTagSelect}
            setSearchTerm={setSearchTerm}
          />
        </div>
      )}
    </header>
);
}
