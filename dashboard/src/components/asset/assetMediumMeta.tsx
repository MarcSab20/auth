import React from "react";

interface AssetMediumMetaProps {
  title: string;      
  price: number;       
}

const AssetMediumMeta: React.FC<AssetMediumMetaProps> = ({ title, price }) => {
  return (
    <div className="bg-white w-full px-2 py-1 flex items-center justify-between">
      {/* Titre réduit */}
      <span className="text-gray-800 font-medium text-sm">{title}</span>

      {/* Prix plus compact */}
      <span className="bg-black px-1 py-1 w-10 text-center rounded-full text-white font-bold text-xs">
        {price}
      </span>
    </div>
  );
};

export default AssetMediumMeta;
