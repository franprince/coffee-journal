'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/images';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ImageCropperProps {
    imageSrc: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCropComplete: (croppedBlob: Blob) => void;
    aspect?: number;
}

export function ImageCropper({ imageSrc, open, onOpenChange, onCropComplete, aspect = 3 / 2 }: ImageCropperProps) {
    const t = useTranslations('Common');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setIsProcessing(true);
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedBlob);
            onOpenChange(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('cropImage')}</DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-[300px] bg-black/5 rounded-md overflow-hidden mt-2">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={onCropChange}
                            onCropComplete={onCropCompleteHandler}
                            onZoomChange={onZoomChange}
                        />
                    )}
                </div>

                <div className="flex items-center gap-2 py-2">
                    <ZoomOut className="w-4 h-4 text-muted-foreground" />
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(val) => setZoom(val[0])}
                        className="flex-1"
                    />
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
