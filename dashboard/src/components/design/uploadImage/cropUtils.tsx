// cropUtils.ts
import { Area } from 'react-easy-crop';

export const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';  // pour éviter les problèmes de CORS si besoin

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Impossible d’obtenir le contexte 2D du canvas'));
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Convertir le canvas en blob puis en URL
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error('Le canvas est vide ou non valide'));
        }
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve(croppedImageUrl);
      }, 'image/jpeg');
    };

    image.onerror = (error) => reject(error);
  });
};
