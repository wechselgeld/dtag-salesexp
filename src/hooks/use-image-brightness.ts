import { useState, useEffect } from 'react';

export function useImageBrightness(imageUrl?: string) {
    const [isDark, setIsDark] = useState<boolean | null>(null);

    useEffect(() => {
        if (!imageUrl) {
            setIsDark(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let r = 0, g = 0, b = 0;
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                }

                const pixels = data.length / 4;
                r = r / pixels;
                g = g / pixels;
                b = b / pixels;

                // Relative luminance using sRGB
                const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

                setIsDark(luminance < 0.5);
            } catch (e) {
                console.error("Could not calculate image brightness", e);
                // Fallback to true (dark) if CORS error
                setIsDark(true);
            }
        };

        img.onerror = () => {
            setIsDark(true);
        };
    }, [imageUrl]);

    return isDark;
}
