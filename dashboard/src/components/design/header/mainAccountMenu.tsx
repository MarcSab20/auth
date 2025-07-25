"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/authenticationContext"; 
import Image from "next/image";
import profile from "@/public/images/PROFILE.png"; 
import { UserIcon } from "@heroicons/react/24/outline"; 

interface ProfileMenuProps {
  toggleMenu: () => void; 
  menuOpen: boolean;
  isSearchActive: boolean;
}

export default function SMPMainAccountMenu({
  toggleMenu,
  menuOpen,
  isSearchActive,
}: ProfileMenuProps) {
  const { isLoggedIn, user, logout } = useAuth();  
  const hoverTimeoutRef = useRef<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);

  // Récupération du nom d'utilisateur
  const username = user?.username || "Utilisateur";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest('[data-popover="profile-menu"]') &&
        !target.closest('[data-menu-icon]')
      ) {
        toggleMenu();
      }
    };

    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen, toggleMenu]);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      toggleMenu();
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    leaveTimeoutRef.current = window.setTimeout(() => {
      toggleMenu();
    }, 2000);
  };

  // Utilisation du contexte pour la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      // La redirection est gérée dans la fonction logout de votre contexte
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="relative inline-block">
      {!isSearchActive && (
        <Image
          src={profile} 
          alt="profile icon"
          onClick={toggleMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer h-6 w-6 object-cover transition-opacity duration-300"
          data-menu-icon
        />
      )}

      {menuOpen && (
        <ul
          role="menu"
          data-popover="profile-menu"
          data-popover-placement="bottom"
          className="absolute right-0 z-90 mt-6 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-sm focus:outline-none"
          onMouseEnter={() => clearTimeout(leaveTimeoutRef.current!)}
          onMouseLeave={handleMouseLeave}
        >
          {!isLoggedIn ? (
            <>
              {/* Si l'utilisateur n'est pas connecté */}
              <li
                role="menuitem"
                className="cursor-pointer text-slate-800 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-100"
                onClick={() => (window.location.href = "/signin")}
              >
                <span className="text-slate-800 font-medium ml-2">Sign In</span>
              </li>
              <li
                role="menuitem"
                className="cursor-pointer text-slate-800 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-100"
                onClick={() => (window.location.href = "/signup")}
              >
                <span className="text-slate-800 font-medium ml-2">Sign Up</span>
              </li>
            </>
          ) : (
            <>
              {/* Si l'utilisateur est connecté */}
              <li
                role="menuitem"
                className="text-slate-800 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-100"
                onClick={() => (window.location.href = "/account/profile")}
              >
                <UserIcon className="h-5 w-5 text-slate-400" />
                <span className="font-medium ml-2">{username}</span>
              </li>
              <li
                role="menuitem"
                className="cursor-pointer text-slate-800 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-100"
                onClick={() => (window.location.href = "/account")}
              >
                <span className="text-slate-800 font-medium ml-2">Tableau de bord</span>
              </li>
              {/* Déconnexion */}
              <li
                role="menuitem"
                className="cursor-pointer text-red-500 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-red-100"
                onClick={handleLogout}
              >
                Logout
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}
