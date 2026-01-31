'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Bean, MapPin, Factory, Camera, Edit2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import type { Coffee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { AddCoffeeForm } from './add-coffee-form';
import { DeleteConfirmDialog, ROAST_LEVELS } from '@/components/shared';
import { getCountryFlag } from '@/lib/country-flags';

interface CoffeeManagerProps {
    coffees: Coffee[];
    onAddCoffee: (coffee: Coffee) => Promise<void>;
    onUpdateCoffee: (coffee: Coffee) => Promise<void>;
    onDeleteCoffee: (id: string) => Promise<void>;
    user: User | null;
}

export function CoffeeManager({ coffees, onAddCoffee, onUpdateCoffee, onDeleteCoffee, user }: CoffeeManagerProps) {
    const t = useTranslations('CoffeeManager');
    const [isOpen, setIsOpen] = useState(false);
    const [coffeeToEdit, setCoffeeToEdit] = useState<Coffee | null>(null);
    const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (coffee: Coffee) => {
        setSelectedCoffee(null); // Close detail view
        setCoffeeToEdit(coffee);
        setIsOpen(true);
    };

    const handleDelete = (id: string) => {
        setIdToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!idToDelete) return;

        // Check authentication before attempting delete
        if (!user) {
            toast.error(t('deleteFailed'));
            setIdToDelete(null);
            return;
        }

        setIsDeleting(true);
        try {
            await onDeleteCoffee(idToDelete);
            toast.success(t('deleteSuccess'));
            setIdToDelete(null);
            setSelectedCoffee(null); // Close detail view after delete
        } catch (error) {
            console.error('Failed to delete coffee:', error);
            toast.error(t('deleteFailed'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-display text-foreground flex items-center gap-2">
                    <Bean className="w-5 h-5 text-primary" />
                    {t('title')}
                </h3>
                {user && (
                    <Dialog open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) setCoffeeToEdit(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                {t('addCoffee')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {coffeeToEdit ? t('editTitle') : t('addTitle')}
                                </DialogTitle>
                            </DialogHeader>
                            <AddCoffeeForm
                                onSubmit={async (coffee) => {
                                    if (coffeeToEdit) {
                                        await onUpdateCoffee(coffee);
                                        toast.success(t('editSuccess'));
                                    } else {
                                        await onAddCoffee(coffee);
                                        toast.success(t('addSuccess'));
                                    }
                                    setIsOpen(false);
                                    setCoffeeToEdit(null);
                                }}
                                onCancel={() => {
                                    setIsOpen(false);
                                    setCoffeeToEdit(null);
                                }}
                                editCoffee={coffeeToEdit || undefined}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coffees.map((coffee) => (
                    <div
                        key={coffee.id}
                        className="glass-card p-0 rounded-2xl border border-border/50 hover:bg-secondary/20 transition-all flex flex-col overflow-hidden group/card cursor-pointer"
                        onClick={() => setSelectedCoffee(coffee)}
                    >
                        {coffee.imageUrl ? (
                            <div className="w-full aspect-[3/2] border-b border-border/50 max-h-[500px] overflow-hidden relative">
                                <Image
                                    src={coffee.imageUrl}
                                    alt={coffee.name}
                                    fill
                                    className="w-full h-full object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-[3/2] bg-secondary/30 flex items-center justify-center border-b border-dashed border-border/50 text-muted-foreground">
                                <Camera className="w-10 h-10 opacity-20" />
                            </div>
                        )}
                        <div className="p-4 flex flex-col gap-3 relative">
                            <div className="w-full">
                                <h4 className="font-bold text-foreground text-lg leading-tight group-hover/card:text-primary transition-colors line-clamp-2">
                                    {coffee.name}
                                </h4>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Factory className="w-4 h-4 opacity-70 shrink-0" />
                                        <span className="truncate">{coffee.roaster}</span>
                                    </div>
                                    {coffee.origin && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground/90">
                                            <MapPin className="w-4 h-4 opacity-70 shrink-0" />
                                            <span className="truncate flex items-center gap-1.5">
                                                {getCountryFlag(coffee.origin) && (
                                                    <span className="text-base">{getCountryFlag(coffee.origin)}</span>
                                                )}
                                                {coffee.origin}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {(() => {
                                    const roast = ROAST_LEVELS.find(r => r.id === coffee.roastLevel);
                                    return (
                                        <span
                                            className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-lg border border-border/50 shrink-0 text-white shadow-sm self-start"
                                            style={{ backgroundColor: roast?.color || '#A47148' }}
                                        >
                                            {roast ? t(`roastLevels.${roast.id}`) : coffee.roastLevel}
                                        </span>
                                    );
                                })()}
                            </div>
                            {coffee.flavors && coffee.flavors.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {coffee.flavors.slice(0, 3).map((flavor, index) => (
                                        <span key={index} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground border border-border/50">
                                            {flavor}
                                        </span>
                                    ))}
                                    {coffee.flavors.length > 3 && (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 text-muted-foreground">
                                            +{coffee.flavors.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Coffee Detail Dialog */}
            <Dialog open={!!selectedCoffee} onOpenChange={(open) => !open && setSelectedCoffee(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedCoffee && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <DialogTitle className="text-2xl">{selectedCoffee.name}</DialogTitle>
                                    {user && selectedCoffee.owner_id === user.id && (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(selectedCoffee);
                                                }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(selectedCoffee.id);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                {selectedCoffee.imageUrl && (
                                    <div className="w-full aspect-[3/2] rounded-lg overflow-hidden relative">
                                        <Image
                                            src={selectedCoffee.imageUrl}
                                            alt={selectedCoffee.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 600px"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Roaster</p>
                                        <p className="font-medium">{selectedCoffee.roaster}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Roast Level</p>
                                        <p className="font-medium">
                                            {ROAST_LEVELS.find(r => r.id === selectedCoffee.roastLevel)
                                                ? t(`roastLevels.${selectedCoffee.roastLevel}`)
                                                : selectedCoffee.roastLevel}
                                        </p>
                                    </div>
                                    {selectedCoffee.origin && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Origin/Region</p>
                                            <p className="font-medium flex items-center gap-1.5">
                                                {getCountryFlag(selectedCoffee.origin) && (
                                                    <span className="text-base">{getCountryFlag(selectedCoffee.origin)}</span>
                                                )}
                                                {selectedCoffee.origin}
                                            </p>
                                        </div>
                                    )}
                                    {selectedCoffee.farm && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Farm</p>
                                            <p className="font-medium">{selectedCoffee.farm}</p>
                                        </div>
                                    )}
                                    {selectedCoffee.altitude && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Altitude</p>
                                            <p className="font-medium">{selectedCoffee.altitude}m</p>
                                        </div>
                                    )}
                                    {selectedCoffee.process && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Process</p>
                                            <p className="font-medium">{selectedCoffee.process}</p>
                                        </div>
                                    )}
                                    {selectedCoffee.variety && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Variety</p>
                                            <p className="font-medium">{selectedCoffee.variety}</p>
                                        </div>
                                    )}
                                </div>

                                {selectedCoffee.flavors && selectedCoffee.flavors.length > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Flavors</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCoffee.flavors.map((flavor, index) => (
                                                <span key={index} className="text-sm font-medium px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground border border-border/50">
                                                    {flavor}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedCoffee.notes && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Notes</p>
                                        <p className="text-sm leading-relaxed">{selectedCoffee.notes}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                isOpen={!!idToDelete}
                onClose={() => !isDeleting && setIdToDelete(null)}
                onConfirm={handleConfirmDelete}
                title={t('removeTitle')}
                description={t('removeDesc')}
                isLoading={isDeleting}
            />
        </div>
    );
}
