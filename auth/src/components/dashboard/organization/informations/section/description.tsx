'use client';
import React from 'react';
import MarkdownMdxEditor from '@/src/components/markdownMDXEditor';

interface DescriptionSectionProps {
  description?: string;
  handleChange: (field: 'description', value: string) => void;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ description, handleChange }) => {
  return (
    <div className="space-y-4 max-h-[32rem] overflow-y-auto">
      <MarkdownMdxEditor
        initialValue={description || ''}
        onChange={(value) => handleChange('description', value)}
        height="24rem"
        placeholder="Entrez la description de l'organisation en Markdown..."
      />
    </div>
  );
};

export default DescriptionSection;
 