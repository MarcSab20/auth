// src/components/update/asset/tab/descriptionSectionAsset.tsx
'use client';

import React from 'react';
import { AssetData } from '@/context/update/asset';
import { Label } from '@/src/components/catalyst/components/label';
import MarkdownMdxEditor from '@/src/components/markdownMDXEditor';

interface DescriptionSectionProps {
  formData: { description?: string };
  handleChange: (fields: Partial<AssetData>) => void;
}

export default function DescriptionSectionAsset({ formData, handleChange }: DescriptionSectionProps) {
  return (
    <div className="space-y-4">
      <Label htmlFor="description">Description</Label>
      <div className="max-h-[32rem] overflow-y-auto">
        <MarkdownMdxEditor
          initialValue={formData.description || ""}
          onChange={(value) => handleChange({ description: value })}
          height="32rem"
          placeholder="Entrez la description..."
        />
      </div>
    </div>
  );
}
