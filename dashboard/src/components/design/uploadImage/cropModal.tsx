// CropModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Cropper, { Area, MediaSize } from 'react-easy-crop';
import { Image } from 'image-js';
import { EditData } from './SMPUploadComponent';

interface CropState {
  x: number;
  y: number;
  index: number;
  url: string;
}

interface CropModalProps {
  cropState: CropState;
  originalUrl: string;
  editData: EditData;
  onClose: () => void;
  onCropComplete: (croppedUrl: string, newEditData: EditData) => void;
  aspectRatio?: number;
}

const containerSize = 400; // Zone de recadrage (400x400)

const CropModal: React.FC<CropModalProps> = ({ cropState, onClose, onCropComplete, aspectRatio = 1 }) => {
  // États de recadrage et réglages
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // originalUrl reste toujours la même (l'image d'origine)
  const [originalUrl] = useState(cropState.url);
  // currentImage contient l'image actuellement modifiée. 
  // Pour la première ouverture, currentImage est l'image d'origine.
  const [currentImage, setCurrentImage] = useState(cropState.url);

  // À la première ouverture de la modal, on initialise les réglages.
  // Note : On ne réinitialise plus currentImage si celui-ci a déjà été modifié.
  useEffect(() => {
    // Si currentImage n'est pas défini (cas de la première ouverture), l'initialiser.
    if (!currentImage) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setBrightness(100);
      setContrast(100);
      setCurrentImage(cropState.url);
    }
    // Ici, on ne remet pas currentImage à cropState.url à chaque ouverture,
    // pour permettre de modifier successivement l'image déjà éditée.
  }, []); // Exécuté uniquement au montage

  // Calcul du minZoom pour que la plus grande dimension de l'image tienne dans le conteneur.
  const onMediaLoaded = useCallback(
    (mediaSize: MediaSize) => {
      const { width, height } = mediaSize;
      const largestDim = Math.max(width, height);
      let requiredZoom = containerSize / largestDim;
      if (requiredZoom > 1) {
        requiredZoom = 1;
      }
      setMinZoom(requiredZoom);
      setMaxZoom(requiredZoom * 3);
      if (zoom < requiredZoom) {
        setZoom(requiredZoom);
      }
    },
    [zoom]
  );

  const onCropCompleteHandler = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Bouton "Ajuster automatiquement" : remet le zoom à minZoom
  const handleAutoAdjust = () => {
    setZoom(minZoom);
  };

  /**
   * Fonction pour recadrer et appliquer les réglages avec image-js.
   * On charge l'image (à partir de currentImage), on effectue le crop et on
   * applique une fonction personnalisée pour ajuster la luminosité et le contraste.
   */
  const getCroppedImgWithFilters = async (
    imageSrc: string,
    pixelCrop: Area,
    brightness: number,
    contrast: number
  ): Promise<string> => {
    const img = await Image.load(imageSrc);
    const cropOptions = {
      x: Math.round(pixelCrop.x),
      y: Math.round(pixelCrop.y),
      width: Math.round(pixelCrop.width),
      height: Math.round(pixelCrop.height),
    };
    let cropped = img.crop(cropOptions);

    // Appliquer des ajustements manuellement
    // Ici, nous utilisons une fonction personnalisée qui parcourt les pixels
    // pour appliquer un offset de luminosité et un facteur de contraste.
    // brightness et contrast sont des pourcentages, 100 = neutre.
    const brightnessOffset = (brightness - 100) * 255 / 100;
    const contrastFactor = contrast / 100; // 1 = neutre
    const data = cropped.data;
    const channels = cropped.channels;
    for (let i = 0; i < data.length; i += channels) {
      for (let c = 0; c < 3; c++) { // Pour R, G, B
        let value = data[i + c];
        value = (value - 128) * contrastFactor + 128 + brightnessOffset;
        data[i + c] = Math.min(255, Math.max(0, Math.round(value)));
      }
    }

    return cropped.toDataURL('image/jpeg');
  };

  // Au clic sur "Valider", on génère l'image modifiée et on met à jour currentImage.
  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedUrl = await getCroppedImgWithFilters(
        currentImage,
        croppedAreaPixels,
        brightness,
        contrast
      );
      // On met à jour currentImage pour que la prochaine édition reparte de la dernière version modifiée.
      setCurrentImage(croppedUrl);
      // On transmet l'URL modifiée au parent
      const newEditData = { brightness, contrast, crop, zoom }; // Create newEditData object
      onCropComplete(croppedUrl, newEditData);
    } catch (error) {
      console.error(error);
    }
  };

  // Réinitialise l'édition pour repartir de l'image d'origine
  const handleResetEdition = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(minZoom);
    setBrightness(100);
    setContrast(100);
    setCurrentImage(originalUrl);
  };

  // Fermer la modal en cliquant sur le backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded shadow-lg flex w-[800px] h-[600px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panneau gauche : zone de recadrage */}
        <div className="w-2/3 relative bg-gray-100">
          <div
            className="w-full h-full"
            style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
          >
            <Cropper
              image={currentImage}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              minZoom={minZoom}
              maxZoom={maxZoom}
              restrictPosition={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteHandler}
              onMediaLoaded={onMediaLoaded}
            />
          </div>
        </div>
        {/* Panneau droit : outils d'édition */}
        <div className="w-1/3 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4">Outils d'édition</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1">Luminosité: {brightness}%</label>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Contraste: {contrast}%</label>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Zoom: {zoom.toFixed(2)}</label>
              <input
                type="range"
                step="0.01"
                min={minZoom}
                max={maxZoom}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleAutoAdjust}
                className="bg-black text-white px-3 py-1 rounded text-sm"
              >
                Ajuster automatiquement
              </button>
              <button
                onClick={handleResetEdition}
                className="bg-gray-900 text-white px-3 py-1 rounded text-sm"
              >
                Réinitialiser l'édition
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCrop}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Valider
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black text-2xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default CropModal;
