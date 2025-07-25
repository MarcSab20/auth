import React from "react";

interface AssetMediumQuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

const AssetMediumQuantitySelector: React.FC<AssetMediumQuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
}) => {
  return (
    <div className="bg-white w-full p-4 rounded-b-3xl flex items-center justify-center space-x-4">
      {/* "Bouton" Décrémentation */}
      <span
        onClick={onDecrease}
        className="
          inline-flex items-center justify-center
          w-4 h-4
          bg-black text-white
          rounded-full
          text-1xl leading-none
          font-bold cursor-pointer
        "
      >
        –
      </span>

      {/* Affichage de la quantité */}
      <span className="font-medium text-black bold text-1xl">{quantity}</span>

      {/* "Bouton" Incrémentation */}
      <span
        onClick={onIncrease}
        className="
          inline-flex items-center justify-center
          w-4 h-4
          bg-black text-white
          rounded-full
          text-1xl leading-none
          font-bold cursor-pointer
        "
      >
        +
      </span>
    </div>
  );
};

export default AssetMediumQuantitySelector;
