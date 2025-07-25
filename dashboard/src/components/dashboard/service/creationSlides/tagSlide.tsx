"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Tag, useServiceContext } from '@/context/create/createServiceContext';
import { Button } from '@/src/components/landing-page/Button';

const tagColors: { [key: string]: string } = {
  Service: 'bg-blue-200 text-blue-800',
  Métier: 'bg-purple-200 text-purple-800',
  Performance: 'bg-green-200 text-green-800',
  Autre: 'bg-gray-200 text-gray-800',
};

const exampleTags: Tag[] = [
  { id: 2, name: 'Éducation', type: 'Métier' },
  { id: 1, name: 'Rapidité', type: 'Performance' },
  { id: 3, name: 'Fiabilité', type: 'Performance' },
  { id: 4, name: 'Restauration', type: 'Métier' },
  { id: 5, name: 'Service client', type: 'Service' },
];

const TagSlide = () => {
  const { formData, updateFormData } = useServiceContext();
  const [newTag, setNewTag] = useState('');
  const [newTagType, setNewTagType] = useState<'Performance' | 'Service' | 'Métier' | 'Autre'>('Métier');
  const [isMobile, setIsMobile] = useState(false);

  // Détection du responsive (mobile si largeur < 768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calcul des tags disponibles
  const availableTags = useMemo(() => {
    const storedTags = formData.advancedAttributes?.serviceTags || [];
    const combined = [...exampleTags, ...storedTags];
    return combined.filter((tag, index, self) =>
      index === self.findIndex(t => t.id === tag.id)
    );
  }, [formData.advancedAttributes?.serviceTags]);

  const selectedTags = formData.advancedAttributes?.serviceTags || [];

  const handleAddTag = () => {
    if (!newTag.trim() || selectedTags.length >= 10) return;
    const newTagEntry: Tag = {
      id: Date.now(),
      name: newTag.trim(),
      type: newTagType,
    };
    updateFormData({
      advancedAttributes: {
        serviceTags: [...selectedTags, newTagEntry],
      },
    });
    setNewTag('');
  };

  const handleSelectTag = (tag: Tag) => {
    if (selectedTags.length >= 10 || selectedTags.some(t => t.id === tag.id)) return;
    updateFormData({
      advancedAttributes: {
        serviceTags: [...selectedTags, tag],
      },
    });
  };

  const handleRemoveTag = (tagId: number) => {
    updateFormData({
      advancedAttributes: {
        serviceTags: selectedTags.filter(t => t.id !== tagId),
      },
    });
  };

  return (
    <div className="relative flex flex-col z-10 items-center justify-center h-full p-4">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Sélectionnez ou créez des tags
      </h2>

      <div className="w-full max-w-4xl space-y-6">
        {isMobile ? (
          // Version mobile : dropdown pour choisir un tag existant
          <div>
            <h3 className="text-lg font-semibold mb-4">Tags existants</h3>
            <select
              className="w-full border p-2 rounded"
              defaultValue=""
              onChange={(e) => {
                const tagId = Number(e.target.value);
                const tag = availableTags.find(t => t.id === tagId);
                if (tag) handleSelectTag(tag);
              }}
            >
              <option value="" disabled>
                Choisissez un tag (tapez pour chercher)
              </option>
              {availableTags.map(tag => (
                <option
                  key={tag.id}
                  value={tag.id}
                  disabled={selectedTags.some(t => t.id === tag.id)}
                >
                  {tag.name}{selectedTags.some(t => t.id === tag.id) ? " (déjà sélectionné)" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          // Version desktop : grille de boutons pour les tags existants et section création de nouveau tag
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">Tags existants</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Button
                    key={tag.id}
                    onClick={() => handleSelectTag(tag)}
                    disabled={selectedTags.some(t => t.id === tag.id)}
                    className={`px-3 py-1 rounded-full text-sm ${tagColors[tag.type]}  transition-opacity disabled:opacity-90`}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Créer un nouveau tag</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Nom du tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 border p-2 rounded"
                />
                <select
                  value={newTagType}
                  onChange={(e) => setNewTagType(e.target.value as any)}
                  className="border p-2 rounded"
                >
                  {Object.keys(tagColors).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || selectedTags.length >= 10}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Tags sélectionnés ({selectedTags.length}/10)
          </h3>
          {isMobile ? (
            // En mobile, afficher les tags sélectionnés en liste verticale
            <div className="flex flex-col gap-2">
              {selectedTags.map(tag => (
                <div
                  key={tag.id}
                  className={`flex items-center px-3 py-1 rounded-full text-sm ${tagColors[tag.type]} justify-between`}
                >
                  <span>{tag.name}</span>
                  <a
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-2 hover:text-black/70"
                  >
                    ×
                  </a>
                </div>
              ))}
            </div>
          ) : (
            // En desktop, afficher les tags sélectionnés dans un carousel horizontal
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
              {selectedTags.map(tag => (
                <div
                  key={tag.id}
                  className={`flex-shrink-0 flex items-center px-3 py-1 rounded-full text-sm ${tagColors[tag.type]}`}
                >
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-2 hover:text-black/70"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagSlide;
