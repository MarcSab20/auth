'use client';
import React, { useMemo, useState } from 'react';
import { ServiceData } from '@/context/update/service';
import { Button } from '@/src/components/landing-page/Button'

export type TagType = 'Performance' | 'Service' | 'Métier' | 'Autre';

export interface Tag {
  id: number;
  name: string;
  type: TagType;
}

interface TagSectionProps {
  formData: Pick<ServiceData, 'advancedAttributes'>;
  handleChange: (field: keyof ServiceData, value: any) => void;
}

const tagColors: { [key in TagType]: string } = {
  Performance: 'bg-green-200 text-green-800',
  Service: 'bg-blue-200 text-blue-800',
  Métier: 'bg-purple-200 text-purple-800',
  Autre: 'bg-gray-200 text-gray-800',
};

const exampleTags: Tag[] = [
  { id: 1, name: 'Rapidité', type: 'Performance' },
  { id: 2, name: 'Éducation', type: 'Métier' },
  { id: 3, name: 'Fiabilité', type: 'Performance' },
  { id: 4, name: 'Restauration', type: 'Métier' },
  { id: 5, name: 'Service client', type: 'Service' },
];

const TagSection: React.FC<TagSectionProps> = ({ formData, handleChange }) => {
  // On parse la chaîne JSON contenue dans advancedAttributes pour obtenir le tableau de tags
  const selectedTags: Tag[] = useMemo(() => {
    try {
      if (!formData.advancedAttributes) return [];
      const parsed = JSON.parse(formData.advancedAttributes);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.tags)) return parsed.tags;
      return [];
    } catch (err) {
      console.error("Erreur de parsing des tags :", err);
      return [];
    }
  }, [formData.advancedAttributes]);

  const [newTag, setNewTag] = useState('');
  const [newTagType, setNewTagType] = useState<TagType>('Performance');

  const handleAddTag = () => {
    if (!newTag.trim() || selectedTags.length >= 10) return;
    const newTagEntry: Tag = {
      id: Date.now(),
      name: newTag.trim(),
      type: newTagType,
    };
    const updatedTags = [...selectedTags, newTagEntry];
    // Appel à handleChange uniquement quand un tag est ajouté
    handleChange('advancedAttributes', JSON.stringify(updatedTags));
    setNewTag('');
  };

  const handleSelectTag = (tag: Tag) => {
    if (selectedTags.length >= 10 || selectedTags.some(t => t.id === tag.id)) return;
    const updatedTags = [...selectedTags, tag];
    handleChange('advancedAttributes', JSON.stringify(updatedTags));
  };

  const handleRemoveTag = (tagId: number) => {
    const updatedTags = selectedTags.filter(t => t.id !== tagId);
    handleChange('advancedAttributes', JSON.stringify(updatedTags));
  };

  // Combine les tags d'exemple et les tags déjà sélectionnés, sans doublons
  const availableTags = useMemo(() => {
    const combined = [...exampleTags, ...selectedTags];
    return combined.filter((tag, index, self) =>
      self.findIndex(t => t.id === tag.id) === index
    );
  }, [selectedTags]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Ajoutez ou modifiez vos tags
      </h2>
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Tags existants</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Button
                key={tag.id}
                onClick={() => handleSelectTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${tagColors[tag.type]} hover:opacity-75 transition-opacity`}
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Tags sélectionnés ({selectedTags.length}/10)
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <div
                key={tag.id}
                className={`flex items-center px-3 py-1 rounded-full text-sm cursor-pointer ${tagColors[tag.type]}`}
              >
                {tag.name}
                <a
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  ×
                </a>
              </div>
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
              onChange={(e) => setNewTagType(e.target.value as TagType)}
              className="border p-2 rounded"
            >
              {Object.keys(tagColors).map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
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
      </div>
    </div>
  );
};

export default TagSection;
