'use client';

import { useState } from 'react';
import { Loader2, Camera, X as CloseIcon } from 'lucide-react';
import type { Coffee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CoffeeService } from '@/lib/db-client';
import { optimizeImage } from '@/lib/images';

interface AddCoffeeFormProps {
    onSuccess: (coffee: Coffee) => void;
    onCancel?: () => void;
    editCoffee?: Coffee;
}

export function AddCoffeeForm({ onSuccess, onCancel, editCoffee }: AddCoffeeFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(editCoffee?.imageUrl || null);

    const [newCoffee, setNewCoffee] = useState<Partial<Coffee>>({
        name: editCoffee?.name || '',
        roaster: editCoffee?.roaster || '',
        roastLevel: editCoffee?.roastLevel || 'medium',
        origin: editCoffee?.origin || '',
        process: editCoffee?.process || '',
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
                name: newCoffee.name || 'Unknown Coffee',
                roaster: newCoffee.roaster || 'Unknown Roaster',
                roastLevel: (newCoffee.roastLevel as any) || 'medium',
                origin: newCoffee.origin,
                process: newCoffee.process,
                notes: newCoffee.notes,
                imageUrl: imageUrl || undefined,
            };

            if (editCoffee) {
                await CoffeeService.updateCoffee(coffee);
            } else {
                await CoffeeService.addCoffee(coffee);
            }

            onSuccess(coffee);
            if (!editCoffee) {
                setNewCoffee({ name: '', roaster: '', roastLevel: 'medium', origin: '', process: '', notes: '' });
                clearImage();
            }
        } catch (error) {
            console.error('Failed to add coffee:', error);
            // TODO: Toast error
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Image Upload Area */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Coffee Image</Label>
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
                            <span className="text-sm text-muted-foreground font-medium">Upload bean photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Bean Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Ethiopia Yirgacheffe"
                    value={newCoffee.name}
                    onChange={(e) => setNewCoffee({ ...newCoffee, name: e.target.value })}
                    required
                    className="bg-background/50 border-input h-10"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="roaster" className="text-sm font-medium">Roaster</Label>
                    <Input
                        id="roaster"
                        placeholder="e.g. Onyx"
                        value={newCoffee.roaster}
                        onChange={(e) => setNewCoffee({ ...newCoffee, roaster: e.target.value })}
                        required
                        className="bg-background/50 border-input h-10"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="roastLevel" className="text-sm font-medium">Roast</Label>
                    <Select
                        value={newCoffee.roastLevel}
                        onValueChange={(val) => setNewCoffee({ ...newCoffee, roastLevel: val as any })}
                    >
                        <SelectTrigger className="bg-background/50 border-input h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="medium-light">Medium-Light</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="medium-dark">Medium-Dark</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="origin" className="text-sm font-medium">Region/Origin <span className="text-xs text-muted-foreground font-normal">(Optional)</span></Label>
                <Input
                    id="origin"
                    placeholder="e.g. Gedeb, Ethiopia"
                    value={newCoffee.origin}
                    onChange={(e) => setNewCoffee({ ...newCoffee, origin: e.target.value })}
                    className="bg-background/50 border-input h-10"
                />
            </div>

            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 h-11 text-sm font-bold"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    className="flex-[2] h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {editCoffee ? 'Saving...' : 'Optimizing...'}
                        </>
                    ) : (
                        editCoffee ? 'Save Changes' : 'Add to Collection'
                    )}
                </Button>
            </div>
        </form>
    );
}
