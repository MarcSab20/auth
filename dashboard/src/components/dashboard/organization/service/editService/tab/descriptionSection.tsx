'use client';

import React from 'react';
import { Label } from '@/src/components/catalyst/components/label';
import { ServiceData } from '@/context/update/service';
import MarkdownMdxEditor from '@/src/components/markdownMDXEditor';

interface DescriptionSectionProps {
  formData: { description?: string };
  handleChange: (field: keyof ServiceData, value: any) => void;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6 max-h-[32rem] overflow-y-auto">
      <MarkdownMdxEditor
        initialValue={formData.description || ""}
        onChange={(value) => handleChange('description', value)}
        height="32rem"
        placeholder="Écrivez votre description ici en Markdown..."
      />
    </div>
  );
};

export default DescriptionSection;
