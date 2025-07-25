// src/components/design/TopicsBar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export type Topic = {
  id: number;
  label: string;
  icon: string;
  tags: string[];
};

const topics: Topic[] = [
  {
    id: 1,
    label: "Éducation",
    icon: "/images/topics/education.png",
    tags: [
      "Lycée",
      "Université",
      "Primaire",
      "Continuité pédagogique",
      "École secondaire",
      "Formation continue",
      "MOOC",
      "BTS",
      "Doctorat",
    ],
  },
  {
    id: 2,
    label: "Restauration",
    icon: "/images/topics/restaurant.png",
    tags: [
      "Boulangerie",
      "Traiteur",
      "Café",
      "Fast Food",
      "Gastronomique",
      "Bistrot",
      "Street food",
      "Livraison",
      "Cuisine du monde",
    ],
  },
  {
    id: 3,
    label: "Informatique",
    icon: "/images/topics/developpement-de-logiciels.png",
    tags: [
      "React",
      "Node.js",
      "DevOps",
      "IA",
      "Mobile",
      "Cloud",
      "Cybersécurité",
      "Big Data",
      "UX/UI",
    ],
  },
  {
    id: 4,
    label: "Santé",
    icon: "/images/topics/soins-de-sante.png",
    tags: [
      "Médecine",
      "Pharmacie",
      "Gériatrie",
      "Nutrition",
      "Dentisterie",
      "Psychologie",
      "Cardiologie",
      "Kinésithérapie",
      "Pédiatrie",
    ],
  },
  {
    id: 5,
    label: "Service à la personne",
    icon: "/images/topics/prestations-de-service.png",
    tags: [
      "Ménage",
      "Garde d'enfants",
      "Aide à domicile",
      "Soutien scolaire",
      "Aide aux seniors",
      "Jardinage",
      "Entretien du domicile",
      "Accompagnement handicap",
    ],
  },
];

type TopicsBarProps = {
  shrinkHeader: boolean;
  selectedTopic: Topic | null;
  onSelectTopic: (t: Topic | null) => void;
  onSelectTag: (tag: string) => void;
  setSearchTerm: (value: string) => void;
};

export function TopicsBar({
  shrinkHeader,
  selectedTopic,
  onSelectTopic,
  onSelectTag,
  setSearchTerm,
}: TopicsBarProps) {
  const [modeTopics, setModeTopics] = useState(true);

  useEffect(() => {
    if (!selectedTopic) setModeTopics(true);
  }, [selectedTopic]);

  const handleTopicClick = (e: React.MouseEvent, topic: Topic) => {
    e.preventDefault();
    onSelectTopic(topic);
    setModeTopics(false);
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    onSelectTag(tag);
    setSearchTerm(tag);
  };

  return (
    <nav className="relative font-chillax w-full bg-white border-b">
      {modeTopics ? (
        <ul className="flex">
          {topics.map((topic) => (
            <li key={topic.id} className="flex-1 px-2">
              <a
                href="#"
                role="button"
                className="block w-full text-center cursor-pointer py-2 hover:bg-gray-50 transition-colors"
                onClick={(e) => handleTopicClick(e, topic)}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={topic.icon}
                    alt={topic.label}
                    width={24}
                    height={24}
                    className="mx-auto hover:scale-110 transition-transform"
                  />
                  <span className="block text-xs mt-1">{topic.label}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center px-4 py-2">
          <a
            href="#"
            role="button"
            className="block p-1 hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              onSelectTopic(null);
            }}
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </a>
          {selectedTopic && (
            <div className="flex items-center ml-2">
              <img
                src={selectedTopic.icon}
                alt={selectedTopic.label}
                width={24}
                height={24}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedTopic.label}
              </span>
            </div>
          )}
          <div className="flex-1 overflow-x-auto flex flex-nowrap items-center gap-2 ml-4 py-1 scrollbar-hide">
            {selectedTopic?.tags.map((tag) => (
              <a
                key={tag}
                href="#"
                role="button"
                className="block flex-shrink-0 px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 hover:opacity-75 transition-opacity"
                onClick={(e) => handleTagClick(e, tag)}
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      )}

      {!modeTopics && (
        <div
          className="absolute inset-x-0 top-full bg-white rounded-b-md shadow-lg
                     overflow-hidden transition-[max-height] duration-300 ease-out
                     max-h-60"
        >
          {/* dropdown étendu si besoin */}
        </div>
      )}
    </nav>
  );
}
