'use client';

import { useState } from 'react';
import { Camera, X as CloseIcon, Edit2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { Coffee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoastLevelSelector } from './roast-level-selector';
import { CoffeeLoader } from '@/components/ui/coffee-loader';
import { CoffeeService } from '@/lib/db-client';
import { optimizeImage } from '@/lib/images';

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

    const [newCoffee, setNewCoffee] = useState<Partial<Coffee>>({
        name: editCoffee?.name || defaultName || 'Coffee Bean',
        roaster: editCoffee?.roaster || '',
        roastLevel: editCoffee?.roastLevel || 'medium',
        origin: editCoffee?.origin || '',
        process: editCoffee?.process || '',
        flavors: editCoffee?.flavors || [],
        notes: editCoffee?.notes || '',
    });

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

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
                process: newCoffee.process,
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
                    process: '',
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
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Editable Header Title */}
            <div className="flex items-center justify-center -mt-2 pb-2">
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
                <div className="flex flex-col items-center gap-4">
                    {imagePreview ? (
                        <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-border group">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="w-full aspect-[3/2] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/20">
                            <Camera className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">{t('form.uploadPlaceholder')}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    )}
                </div>
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
                    <Input
                        id="origin"
                        placeholder={t('form.originPlaceholder')}
                        value={newCoffee.origin}
                        onChange={(e) => setNewCoffee({ ...newCoffee, origin: e.target.value })}
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
                <div className="space-y-2">
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

            <div className="flex gap-3 pt-2">
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
