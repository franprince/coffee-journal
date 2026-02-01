/**
 * Optimizes an image file for upload by resizing and compressing it.
 * @param file The original image file from an <input type="file">
 * @param maxWidth The maximum width/height allowed
 * @param quality The JPEG compression quality (0 to 1)
 * @returns A promise that resolves to a Blob (JPEG)
 */
export async function optimizeImage(
    file: File,
    maxWidth = 800,
    quality = 0.7
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width = Math.round((width * maxWidth) / height);
                        height = maxWidth;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Use high-quality interpolation
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * Creates a cropped image from a source image and crop area.
 * @param imageSrc The source image URL
 * @param pixelCrop The crop area in pixels
 * @param rotation The rotation angle in degrees
 * @returns A promise that resolves to a Blob (JPEG)
 */
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    quality = 0.9
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const rotRad = getRadianAngle(rotation);

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // Set canvas size to match the bounding box
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(pixelCrop.width / 2, pixelCrop.height / 2);
    ctx.rotate(rotRad);
    ctx.translate(-bBoxWidth / 2, -bBoxHeight / 2);

    // Draw rotated image
    ctx.drawImage(image, 0, 0);

    // Get the cropped area from the rotated image
    const data = ctx.getImageData(
        pixelCrop.x - (bBoxWidth - pixelCrop.width) / 2,
        pixelCrop.y - (bBoxHeight - pixelCrop.height) / 2,
        pixelCrop.width,
        pixelCrop.height
    );

    // Set canvas width to final desired crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Paste generated rotate image with correct size
    ctx.putImageData(data, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg', quality);
    });
}

const getRadianAngle = (degreeValue: number): number => {
    return (degreeValue * Math.PI) / 180;
};

const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation);

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
};

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous'; // Fix CORS issue for cross-origin images
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

