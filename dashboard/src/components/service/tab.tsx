"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Description from "./tab/description";
import Performance from "./tab/performance";
import Details from "./tab/details";
import { ServiceData } from "./serviceDetails";

interface TabComponentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  description?: string;
  service: ServiceData;
}

const TabContent: React.FC<{ tab: string; description?: string; service: ServiceData }> = ({ tab, description, service }) => {
  console.log("service.description:", service.description);
  return (
    <>
      {tab === "Description" && <Description description={description} />}
      {tab === "Details" && (
        <Details
          serviceID={service.serviceID}
          locationID={service.locationID}
        />
      )}
      {tab === "Performance" && <Performance />}
    </>
  );
};

export const TabsComponent: React.FC<TabComponentProps> = ({
  activeTab,
  setActiveTab,
  description,
  service,
}) => {
  const [cursorStyle, setCursorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef<HTMLUListElement>(null);

  return (
    <div className="relative">
      {/* Barre de navigation fixe (relative à ce parent) */}
      <ul
        ref={containerRef}
        onMouseLeave={() => setCursorStyle((prev) => ({ ...prev, opacity: 0 }))}
        className="relative mx-auto flex w-fit p-1 rounded-t-lg bg-gray-100 shadow"
      >
        {["Description", "Details", "Performance"].map((tabName) => (
          <Tab
            key={tabName}
            tabName={tabName}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setCursorStyle={setCursorStyle}
            containerRef={containerRef}
          />
        ))}
        <motion.li
          animate={cursorStyle}
          transition={{ duration: 0.3 }}
          className="absolute z-0 h-full rounded-t-lg bg-gray-300"
          style={{ left: cursorStyle.left, width: cursorStyle.width, pointerEvents: "none" }}
        />
      </ul>

      {/* Contenu des onglets : zone défilable */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        // Fixez par exemple la hauteur ou la hauteur max, et activez le scroll vertical
        className="relative border-t bg-white p-4 max-h-[550px] overflow-y-auto"
      >
        <TabContent tab={activeTab} description={description} service={service} />
      </motion.div>
    </div>
  );
};

interface TabProps {
  tabName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setCursorStyle: React.Dispatch<
    React.SetStateAction<{ left: number; width: number; opacity: number }>
  >;
  containerRef: React.RefObject<HTMLUListElement>;
}

const Tab: React.FC<TabProps> = ({
  tabName,
  activeTab,
  setActiveTab,
  setCursorStyle,
  containerRef,
}) => {
  const ref = useRef<HTMLLIElement>(null);

  const updateCursor = () => {
    if (ref.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = ref.current.getBoundingClientRect();
      const relativeLeft = tabRect.left - containerRect.left;
      setCursorStyle({ left: relativeLeft, width: tabRect.width, opacity: 1 });
    }
  };

  const handleTabClick = () => {
    updateCursor();
    setActiveTab(tabName);
  };

  return (
    <li
      ref={ref}
      onMouseEnter={updateCursor}
      onClick={handleTabClick}
      className={`relative z-10 cursor-pointer px-4 py-2 font-medium transition-colors hover:text-black ${
        activeTab === tabName ? "text-black" : "text-gray-600"
      }`}
    >
      {tabName}
    </li>
  );
};

export default TabsComponent;
