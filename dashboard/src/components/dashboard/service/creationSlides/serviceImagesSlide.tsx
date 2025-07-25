// /components/MediaSlide.tsx
"use client";

import React, { useState, useEffect } from "react";
import { FiUpload, FiPlus, FiX } from "react-icons/fi";
import { useServiceContext } from "@/context/create/createServiceContext";

interface MediaSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const MAX_IMAGES = 6;

const MediaSlide: React.FC<MediaSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useServiceContext();
  const [images, setImages] = useState<File[]>(formData.images || []);

  useEffect(() => {
    updateFormData({ images });
    onValidateStep(true);
  }, [images, updateFormData, onValidateStep]);

  const handleFiles = (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    setImages((prev) => [...prev, ...valid].slice(0, MAX_IMAGES));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (images.length >= MAX_IMAGES) return;
    const toAdd = Array.from(e.dataTransfer.files).slice(
      0,
      MAX_IMAGES - images.length
    );
    handleFiles(toAdd);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const toAdd = Array.from(e.target.files).slice(
      0,
      MAX_IMAGES - images.length
    );
    handleFiles(toAdd);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full space-y-8">
      <h2 className="text-4xl font-bold text-gray-900 text-center">
        Ajoutez jusqu'à {MAX_IMAGES} images pour votre service
      </h2>
      <p className="text-lg text-gray-600 text-center">
        Format recommandé : 400x300 pixels • {images.length}/{MAX_IMAGES} images ajoutées
      </p>
      
      <div
        className="w-full max-w-4xl md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible flex flex-nowrap overflow-x-auto gap-4"
        style={{ minHeight: '8rem' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {Array.from({ length: MAX_IMAGES }).map((_, idx) => {
          const img = images[idx];
          return (
            <div
              key={idx}
              className="relative flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 min-w-[70vw] md:min-w-0 w-full"
            >
              {img instanceof File ? (
                <>
                  <img
                    src={URL.createObjectURL(img)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                </>
              ) : img ? (
                <>
                  <img
                    src={typeof img === 'string' ? img : ''}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                </>
              ) : (
                <label
                  htmlFor={`media-upload-${idx}`}
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  {idx === images.length ? (
                    <FiUpload size={32} className="text-gray-400" />
                  ) : (
                    <FiPlus size={32} className="text-gray-400" />
                  )}
                  <span className="text-sm text-gray-500 mt-2">
                    {idx === images.length ? "Uploader" : "Ajouter"}
                  </span>
                  <input
                    type="file"
                    id={`media-upload-${idx}`}
                    accept="image/*"
                    onChange={handleInput}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MediaSlide;
