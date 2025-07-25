// utils/cropImage.ts
export default function getCroppedImg(imageSrc: string | null, pixelCrop: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!imageSrc) {
        return reject("Image non disponible");
      }
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d");
  
        ctx?.drawImage(
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
  
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error("Canvas vide");
            return reject("Canvas vide");
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        }, "image/jpeg");
      };
      image.onerror = (error) => reject(error);
    });
  }
  