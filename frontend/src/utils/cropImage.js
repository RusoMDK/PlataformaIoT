// src/utils/cropImage.js
import Cropper from 'cropperjs';

export default async function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const radius = Math.min(crop.width, crop.height) / 2;
      const centerX = crop.width / 2;
      const centerY = crop.height / 2;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      ctx.restore();

      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Falló el recorte'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    };
    image.onerror = () => reject(new Error('Falló la carga de imagen'));
  });
}