import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/src/components/cropImage"; // voir code helper ci-dessous
import { Button } from '@/src/components/landing-page/Button'

interface ImageResizerProps {
  onUpload: (url: string) => void;
}

const ImageResizer: React.FC<ImageResizerProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropAndUpload = async () => {
    try {
      const croppedImage = await getCroppedImg(preview, croppedAreaPixels);
      onUpload(croppedImage);
      setIsCropping(false);
      setPreview(null);
      setFile(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative w-full h-32 bg-gray-200 flex items-center justify-center rounded-md">
      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setIsCropping(true)}
          />
          {isCropping && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64">
                <Cropper
                  image={preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="mt-4 flex space-x-2">
                <Button onClick={handleCropAndUpload}>
                  Valider
                </Button>
                <Button onClick={() => setIsCropping(false)} variant="outline">
                  Annuler
                </Button>
              </div>
            </div>
          )}
          {!isCropping && (
            <Button
              onClick={() => setIsCropping(true)}
              className="absolute bottom-2 right-2"
            >
              ✓
            </Button>
          )}
        </>
      ) : (
        <label className="cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <span className="text-gray-500">Ajouter une image</span>
        </label>
      )}
    </div>
  );
};

export default ImageResizer;
