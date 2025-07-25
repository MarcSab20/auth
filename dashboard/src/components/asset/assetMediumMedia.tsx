import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface AssetMediumMediaProps {
  images?: string[];   
  altText?: string;
}

const AssetMediumMedia: React.FC<AssetMediumMediaProps> = ({ images, altText }) => {

  const imageUrl = images && images.length > 0 ? images[0] : null;

  return (
    <div className="bg-white w-full h-25 rounded-t-2xl overflow-hidden flex items-center justify-center">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={altText || "asset image"}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="text-gray-400 text-sm">No Image</div>
      )}
    </div>
  );
};

export default AssetMediumMedia;
