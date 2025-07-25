import React from 'react';
import { Input } from '@/src/components/catalyst/components/input';
import { Label } from '@/src/components/catalyst/components/label';
import { useUpdateAssetContext } from '@/context/update/asset';

const DetailsSectionAsset: React.FC = () => {
  const { assetFormData, updateAssetForm } = useUpdateAssetContext();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Titre de l'asset</Label>
        <Input
          value={assetFormData.title || ''}
          onChange={e => updateAssetForm({ title: e.target.value })}
          placeholder="Entrez le titre de l'asset"
          className="mt-1 w-full"
        />
      </div>
    </div>
  );
};

export default DetailsSectionAsset; 