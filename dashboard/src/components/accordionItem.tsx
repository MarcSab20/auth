import React, { useState } from "react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  // SVG pour l'icône Plus
  const plusSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
    </svg>
  );

  // SVG pour l'icône Moins
  const minusSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
    </svg>
  );

  return (
    <div className="mb-4">
      <button
        onClick={toggleAccordion}
        className="w-full flex justify-between items-center py-4 px-4 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
      >
        <span className="text-lg font-medium text-gray-800">{title}</span>
        <span className="text-gray-800 transition-transform duration-300">
          {isOpen ? minusSVG : plusSVG}
        </span>
      </button>

      <div
        className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="p-4 bg-gray-50 rounded-lg shadow-inner overflow-y-auto max-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
