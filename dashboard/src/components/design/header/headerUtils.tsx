import { useState, RefObject } from "react";
import { useAuth } from "@/context/authenticationContext";
import SMPMainNotificationMenu from "./mainNotificationMenu";
import SMPMainAccountMenu from "./mainAccountMenu";
import SMPMainSearch from "../mainSearch";
import SMPHeaderLogo from "../headerLogo";
import SmallLogo from "@/public/images/LOGOROUGE.png"; 

type HeaderUtilsProps = {
  toggleMenu: () => void;
  menuOpen: boolean;
  isSearchActive: boolean;    
  onFocus: () => void;
  onBlur: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchInputRef?: RefObject<HTMLInputElement>;
};

export default function HeaderUtils({
  toggleMenu,
  menuOpen,
  isSearchActive,
  onFocus,
  onBlur,
  searchTerm,
  setSearchTerm,
  searchInputRef,
}: HeaderUtilsProps) {
  const [searchActive, setSearchActive] = useState(false);
  const { isLoggedIn } = useAuth();

  const handleSearchFocus = () => {
    setSearchActive(true);
    onFocus();
  };

  const handleSearchBlur = () => {
    setSearchActive(false);
    onBlur();
  };

  return (
    <div className="flex items-center justify-between w-full transition-all duration-300">
      {/* Logo qui devient petit quand la recherche est active */}
      <div className="flex items-center">
        {searchActive ? (
          <img src={SmallLogo.src} alt="Small Logo" className="h-8" />
        ) : (
          <SMPHeaderLogo />
        )}
      </div>

      {/* Barre de recherche : occupe tout l'espace entre le logo et les icônes */}
      <div
        className={`flex-1 flex justify-center transition-all duration-300 ${
          searchActive ? "w-full" : "w-auto"
        }`}
      >
        <SMPMainSearch
          isSearchActive={searchActive}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          inputRef={searchInputRef}
        />
      </div>

      {/* Icônes (notification et compte) masquées si la recherche est active */}
      <div
        className={`flex items-center space-x-4 transition-opacity duration-300 ${
          searchActive ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {isLoggedIn && <SMPMainNotificationMenu />}
        <SMPMainAccountMenu
          toggleMenu={toggleMenu}
          menuOpen={menuOpen}
          isSearchActive={searchActive}
        />
      </div>
    </div>
  );
}
