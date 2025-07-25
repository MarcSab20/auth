import React from "react";
import AssetMediumMedia from "./assetMediumMedia";
import AssetMediumMeta from "./assetMediumMeta";
import AssetMediumQuantitySelector from "./assetMediumQuantitySelector";

export interface SMPAsset {
  assetID: string;
  uniqRef?: string;
  slug?: string;
  title: string;
  authorID?: string;
  organizationID?: string;
  mediaID?: string;
  description?: string;
  price: number;
  legalVatPercent?: number;
  quantity: number;
  stockQuantity?: number;
  maxPerReservation?: number;
  conflictingAssets?: string;
  applyableAssets?: string;
  state: string; // ObjectStatus (ici représenté par une chaîne de caractères)
  createdAt: string; // DateTime au format ISO8601
  updatedAt: string; // DateTime au format ISO8601
  deletedAt?: string; // DateTime au format ISO8601
  images?: string[];
}

interface SMPAssetCardProps {
  asset: SMPAsset;
  quantity: number;
  onIncrease: (assetId: string) => void;
  onDecrease: (assetId: string) => void;
  showQuantitySelector?: boolean; // Affiche le sélecteur seulement si true
}

const SMPAssetCard: React.FC<SMPAssetCardProps> = ({
  asset,
  quantity,
  onIncrease,
  onDecrease,
  showQuantitySelector = false,
}) => {
  return (
    <div
      className="
        w-[200px] 
        flex flex-col
        rounded-2xl
        shadow-lg
        bg-white
        hover:shadow-2xl
        transition-shadow
      "
    >
      <AssetMediumMedia images={asset.images} altText={asset.title} />
      <AssetMediumMeta title={asset.title} price={asset.price} />
      {showQuantitySelector && (
        <AssetMediumQuantitySelector
          quantity={quantity}
          onIncrease={() => onIncrease(asset.assetID)}
          onDecrease={() => onDecrease(asset.assetID)}
        />
      )}
    </div>
  );
};

export default SMPAssetCard;
