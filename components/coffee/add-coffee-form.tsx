'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, X as CloseIcon, Edit2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { Coffee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoastLevelSelector } from '@/components/shared';
import { CoffeeLoader } from '@/components/ui/coffee-loader';
import { CoffeeService } from '@/lib/db-client';
import { optimizeImage } from '@/lib/images';
import { ImageCropper } from '@/components/ui/image-cropper';
import { getCountryFlag } from '@/lib/country-flags';

interface AddCoffeeFormProps {
    onSubmit: (coffee: Coffee) => Promise<void>;
    onCancel?: () => void;
    editCoffee?: Coffee;
    defaultName?: string;
}

export function AddCoffeeForm({ onSubmit, onCancel, editCoffee, defaultName }: AddCoffeeFormProps) {
    const t = useTranslations('CoffeeManager');
    const [isUploading, setIsUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(editCoffee?.imageUrl || null);

    // Cropper State
    const [cropperOpen, setCropperOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
    const [originalFileName, setOriginalFileName] = useState<string>('image.jpg');
    const uploadAreaRef = useRef<HTMLDivElement>(null);

    const [newCoffee, setNewCoffee] = useState<Partial<Coffee>>({
        name: editCoffee?.name || defaultName || 'Coffee Bean',
        roaster: editCoffee?.roaster || '',
        roastLevel: editCoffee?.roastLevel || 'medium',
        origin: editCoffee?.origin || '',
        farm: editCoffee?.farm || '',
        altitude: editCoffee?.altitude,
        process: editCoffee?.process || '',
        variety: editCoffee?.variety || '',
        flavors: editCoffee?.flavors || [],
        notes: editCoffee?.notes || '',
    });

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImageSrc(reader.result as string);
                setCropperOpen(true);
            };
            reader.readAsDataURL(file);
            // Reset input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const file = new File([croppedBlob], originalFileName, { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(croppedBlob));
        setCropperOpen(false);
        setTempImageSrc(null);
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    setOriginalFileName('pasted-image.jpg');
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setTempImageSrc(reader.result as string);
                        setCropperOpen(true);
                    };
                    reader.readAsDataURL(blob);
                    e.preventDefault();
                    break;
                }
            }
        }
    };

    const handleEditImage = () => {
        if (imagePreview) {
            setTempImageSrc(imagePreview);
            setCropperOpen(true);
        }
    };

    // Add paste event listener
    useEffect(() => {
        const handlePasteEvent = (e: ClipboardEvent) => handlePaste(e);
        document.addEventListener('paste', handlePasteEvent);
        return () => {
            document.removeEventListener('paste', handlePasteEvent);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let imageUrl = editCoffee?.imageUrl || '';
            if (imageFile) {
                const optimizedBlob = await optimizeImage(imageFile);
                imageUrl = await CoffeeService.uploadCoffeeImage(optimizedBlob, imageFile.name);
            }

            const coffee: Coffee = {
                id: editCoffee?.id || crypto.randomUUID(),
                name: newCoffee.name || defaultName || 'Unknown Coffee',
                roaster: newCoffee.roaster || 'Unknown Roaster',
                roastLevel: (newCoffee.roastLevel as any) || 'medium',
                origin: newCoffee.origin,
                farm: newCoffee.farm,
                altitude: newCoffee.altitude,
                process: newCoffee.process,
                variety: newCoffee.variety,
                flavors: newCoffee.flavors,
                notes: newCoffee.notes,
                imageUrl: imageUrl || undefined,
            };

            await onSubmit(coffee);

            toast.success(editCoffee ? t('editSuccess') : t('addSuccess'));

            if (!editCoffee) {
                setNewCoffee({
                    name: defaultName || 'Coffee Bean',
                    roaster: '',
                    roastLevel: 'medium',
                    origin: '',
                    farm: '',
                    altitude: undefined,
                    process: '',
                    variety: '',
                    flavors: [],
                    notes: ''
                });
                clearImage();
            }
        } catch (error) {
            console.error('Failed to save coffee:', error);
            toast.error(editCoffee ? t('editFailed') : t('addFailed'));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-4 pt-2 custom-scrollbar">
                {/* Editable Header Title */}
                <div className="flex items-center justify-center pb-2">
                    <div className="relative group">
                        <input
                            type="text"
                            value={newCoffee.name}
                            onChange={(e) => setNewCoffee({ ...newCoffee, name: e.target.value })}
                            className="text-2xl font-display font-bold text-center bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-muted-foreground/50 max-w-[280px]"
                            placeholder={defaultName || t('form.namePlaceholder')}
                            required
                        />
                        <Edit2 className="w-4 h-4 text-muted-foreground absolute -right-6 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-2">
                    <div className="flex flex-col items-center gap-4" ref={uploadAreaRef}>
                        {imagePreview ? (
                            <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-border group">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleEditImage}
                                        className="p-2 bg-white/90 text-foreground rounded-full hover:bg-white transition-colors"
                                        title={t('form.editImage')}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="p-2 bg-white/90 text-foreground rounded-full hover:bg-white transition-colors"
                                        title="Remove"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="w-full aspect-[3/2] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/20">
                                <Camera className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground font-medium">{t('form.uploadPlaceholder')}</span>
                                <span className="text-xs text-muted-foreground/70">{t('form.pasteHint')}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    <ImageCropper
                        imageSrc={tempImageSrc}
                        open={cropperOpen}
                        onOpenChange={(open) => {
                            if (!open) {
                                setCropperOpen(false);
                                setTempImageSrc(null);
                            }
                        }}
                        onCropComplete={handleCropComplete}
                        aspect={3 / 2}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="roaster" className="text-sm font-medium">{t('form.roasterLabel')}</Label>
                        <Input
                            id="roaster"
                            placeholder={t('form.roasterPlaceholder')}
                            value={newCoffee.roaster}
                            onChange={(e) => setNewCoffee({ ...newCoffee, roaster: e.target.value })}
                            required
                            className="bg-background/50 border-input h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="origin" className="text-sm font-medium">{t('form.originLabel')} <span className="text-xs text-muted-foreground font-normal">{t('form.optional')}</span></Label>
                        <div className="relative">
                            <Input
                                id="origin"
                                placeholder={t('form.originPlaceholder')}
                                value={newCoffee.origin}
                                onChange={(e) => setNewCoffee({ ...newCoffee, origin: e.target.value })}
                                className="bg-background/50 border-input h-10 pr-10"
                            />
                            {newCoffee.origin && getCountryFlag(newCoffee.origin) && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                                    {getCountryFlag(newCoffee.origin)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="farm" className="text-sm font-medium">{t('form.regionLabel')} <span className="text-xs text-muted-foreground font-normal">{t('form.optional')}</span></Label>
                        <Input
                            id="farm"
                            placeholder={t('form.regionPlaceholder')}
                            value={newCoffee.farm}
                            onChange={(e) => setNewCoffee({ ...newCoffee, farm: e.target.value })}
                            className="bg-background/50 border-input h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="altitude" className="text-sm font-medium">{t('form.altitudeLabel')} <span className="text-xs text-muted-foreground font-normal">{t('form.optional')}</span></Label>
                        <Input
                            id="altitude"
                            type="number"
                            placeholder={t('form.altitudePlaceholder')}
                            value={newCoffee.altitude || ''}
                            onChange={(e) => setNewCoffee({ ...newCoffee, altitude: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="bg-background/50 border-input h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="process" className="text-sm font-medium">{t('form.processLabel')} <span className="text-xs text-muted-foreground font-normal">{t('form.optional')}</span></Label>
                        <Input
                            id="process"
                            placeholder={t('form.processPlaceholder')}
                            value={newCoffee.process}
                            onChange={(e) => setNewCoffee({ ...newCoffee, process: e.target.value })}
                            className="bg-background/50 border-input h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="variety" className="text-sm font-medium">{t('form.varietyLabel')} <span className="text-xs text-muted-foreground font-normal">{t('form.optional')}</span></Label>
                        <Input
                            id="variety"
                            placeholder={t('form.varietyPlaceholder')}
                            value={newCoffee.variety}
                            onChange={(e) => setNewCoffee({ ...newCoffee, variety: e.target.value })}
                            className="bg-background/50 border-input h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('form.roastLevelLabel')}</Label>
                        <RoastLevelSelector
                            value={newCoffee.roastLevel || 'medium'}
                            onChange={(val) => setNewCoffee({ ...newCoffee, roastLevel: val })}
                        />
                    </div>

                    {/* Flavors Tag Input */}
                    <div className="space-y-2 pb-4">
                        <Label htmlFor="flavors" className="text-sm font-medium">{t('form.flavorsLabel')}</Label>
                        <div className="bg-background/50 border border-input rounded-md px-3 py-2 min-h-[2.5rem] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                            {(newCoffee.flavors || []).map((flavor, index) => (
                                <div key={index} className="flex items-center bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded-md">
                                    {flavor}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = (newCoffee.flavors || []).filter((_, i) => i !== index);
                                            setNewCoffee({ ...newCoffee, flavors: updated });
                                        }}
                                        className="ml-1 hover:text-destructive focus:outline-none"
                                    >
                                        <CloseIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <input
                                id="flavors"
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] placeholder:text-muted-foreground"
                                placeholder={t('form.flavorsPlaceholder')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            const current = newCoffee.flavors || [];
                                            if (!current.includes(val)) {
                                                setNewCoffee({ ...newCoffee, flavors: [...current, val] });
                                            }
                                            e.currentTarget.value = '';
                                        }
                                    } else if (e.key === 'Backspace' && !e.currentTarget.value && (newCoffee.flavors?.length || 0) > 0) {
                                        const current = newCoffee.flavors || [];
                                        setNewCoffee({ ...newCoffee, flavors: current.slice(0, -1) });
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t bg-background mt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 h-11 text-sm font-bold"
                    >
                        {t('form.cancel')}
                    </Button>
                )}
                <Button
                    type="submit"
                    className="flex-[2] h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <CoffeeLoader className="w-5 h-5 mr-2" />
                            {editCoffee ? t('form.saving') : t('form.optimizing')}
                        </>
                    ) : (
                        editCoffee ? t('form.save') : t('form.add')
                    )}
                </Button>
            </div>
        </form>
    );
}
