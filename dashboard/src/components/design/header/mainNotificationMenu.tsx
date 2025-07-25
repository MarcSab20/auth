"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import SMPNotificationlogo from "@/public/images/notification.png";
import notifications from "../../ui/notificationsMocks"; // Chemin vers ton fichier mock

export default function SMPMainNotificationMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Ouvrir le menu après 1 seconde d'immobilité sur l'icône
  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setDropdownOpen(true);
    }, 1000);
  };

  // Fermer le menu après 2 secondes hors de la zone
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    leaveTimeoutRef.current = window.setTimeout(() => {
      setDropdownOpen(false);
    }, 2000);
  };

  // Fermer le dropdown si l'utilisateur clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <a
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={toggleDropdown}
        className="relative z-10 block rounded-md bg-white p-2 focus:outline-none "
      >
        <Image
          className="h-7 w-7 mt-1.5"
          src={SMPNotificationlogo}
          alt="Notification Icon"
          width={25}
          height={25}
        />
      </a>

      {dropdownOpen && (
        <>
          {/* Overlay de fond semi-transparent pour fermer le dropdown */}
          <div
            onClick={() => setDropdownOpen(false)}
          ></div>

          <div
            onMouseEnter={() => {
              if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="absolute right-0 mt-2 bg-white rounded-md  overflow-hidden z-20  duration-300"
            style={{ width: "20rem", maxHeight: "400px", overflowY: "auto" }}
          >
            <div className="py-2">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <a
                    key={notification.id}
                    href="#"
                    className="flex items-center px-4 py-3 border-b  -mx-2 "
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover mx-1"
                      src={notification.avatar}
                      alt="avatar"
                    />
                    <p className="text-gray-600 text-sm mx-2">
                      <span className="font-bold">{notification.name}</span>{" "}
                      {notification.action}{" "}
                      <span className="font-bold text-blue-500">
                        {notification.target}
                      </span>{" "}
                      . {notification.time}
                    </p>
                  </a>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  Vous n'avez pas de notification pour le moment.
                </div>
              )}
            </div>

            {/* Lien pour voir toutes les notifications */}
            <a
              href={notifications.length > 0 ? "#" : undefined}
              className={`block text-center font-bold py-2 transition-colors ${
                notifications.length > 0
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-300 text-gray-500 cursor-default pointer-events-none"
              }`}
            >
              Voir toutes les notifications
            </a>
          </div>
        </>
      )}
    </div>
  );
}
