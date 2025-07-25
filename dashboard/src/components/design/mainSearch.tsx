import React, { ChangeEvent, RefObject } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

type SMPSearchProps = {
  onFocus: () => void;
  onBlur: () => void;
  isSearchActive: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isMobile?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
};

export default function SMPMainSearch({
  onFocus,
  onBlur,
  isSearchActive,
  searchTerm,
  setSearchTerm,
  isMobile = false,
  inputRef,
}: SMPSearchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearInput = () => {
    setSearchTerm("");
  };

  // Style commun pour les icônes Heroicons
  const iconStyle = { fill: "none", background: "transparent" };

  if (isMobile && !isSearchActive) {
    return (
      <div
        className="flex items-center justify-center w-10 h-10 cursor-pointer"
        onClick={onFocus}
      >
        <MagnifyingGlassIcon 
          className="w-6 h-6 text-gray-400" 
          style={iconStyle}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <MagnifyingGlassIcon 
          className="w-5 h-5 text-gray-400" 
          style={iconStyle}
        />
      </div>
      <input
        id="mainSearch"
        name="search"
        type="text"
        placeholder="Cherchez votre service idéal..."
        value={searchTerm}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={inputRef}
        className={`
          block w-full h-12
          pl-12 pr-12
          rounded-full
          border border-gray-200 bg-white
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          transition-shadow duration-200
        `}
      />
      {searchTerm && (
        <a
          href="#"
          role="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearInput}
          className="absolute inset-y-0 right-4 flex items-center"
        >
          <XMarkIcon 
            className="w-5 h-5 text-gray-400 hover:text-gray-600" 
            style={iconStyle}
          />
        </a>
      )}
    </div>
  );
}
