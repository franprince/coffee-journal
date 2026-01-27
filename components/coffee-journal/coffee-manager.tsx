'use client';

import { useState } from 'react';
import { Plus, Bean, MapPin, Factory, Camera, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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
import { DeleteConfirmDialog } from './delete-confirm-dialog';

interface CoffeeManagerProps {
    coffees: Coffee[];
    onAddCoffee: (coffee: Coffee) => Promise<void>;
    onUpdateCoffee: (coffee: Coffee) => Promise<void>;
    onDeleteCoffee: (id: string) => Promise<void>;
}

export function CoffeeManager({ coffees, onAddCoffee, onUpdateCoffee, onDeleteCoffee }: CoffeeManagerProps) {
    const t = useTranslations('CoffeeManager');
    const [isOpen, setIsOpen] = useState(false);
    const [coffeeToEdit, setCoffeeToEdit] = useState<Coffee | null>(null);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (coffee: Coffee) => {
        setCoffeeToEdit(coffee);
        setIsOpen(true);
    };

    const handleDelete = (id: string) => {
        setIdToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            await onDeleteCoffee(idToDelete);
            toast.success(t('deleteSuccess'));
            setIdToDelete(null);
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
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setCoffeeToEdit(null);
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-4 h-4 mr-1.5" />
                            {t('addCoffee')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        className="glass-card border-border sm:max-w-[425px]"
                        onInteractOutside={(e) => e.preventDefault()}
                    >
                        <DialogHeader>
                            <DialogTitle className="sr-only">{coffeeToEdit ? t('editTitle') : t('addTitle')}</DialogTitle>
                        </DialogHeader>
                        <AddCoffeeForm
                            editCoffee={coffeeToEdit || undefined}
                            defaultName={`Coffee Bean #${coffees.length + 1}`}
                            onSubmit={async (coffee) => {
                                if (coffeeToEdit) {
                                    await onUpdateCoffee(coffee);
                                } else {
                                    await onAddCoffee(coffee);
                                }
                                setIsOpen(false);
                                setCoffeeToEdit(null);
                            }}
                            onCancel={() => {
                                setIsOpen(false);
                                setCoffeeToEdit(null);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {coffees.map((coffee) => (
                    <div
                        key={coffee.id}
                        className="glass-card p-0 rounded-2xl border border-border/50 hover:bg-secondary/20 transition-all flex flex-col overflow-hidden group/card"
                    >
                        {coffee.imageUrl ? (
                            <div className="w-full aspect-[3/2] border-b border-border/50 max-h-[500px] overflow-hidden">
                                <img src={coffee.imageUrl} alt={coffee.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-full aspect-[3/2] bg-secondary/30 flex items-center justify-center border-b border-dashed border-border/50 text-muted-foreground">
                                <Camera className="w-10 h-10 opacity-20" />
                            </div>
                        )}
                        <div className="p-4 flex flex-col gap-2 relative">
                            <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-foreground text-lg leading-tight group-hover/card:text-primary transition-colors pr-16">{coffee.name}</span>
                                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                        onClick={() => handleEdit(coffee)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(coffee.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <span className="text-[10px] absolute bottom-4 right-4 uppercase tracking-widest font-black px-2 py-0.5 rounded-lg bg-secondary text-secondary-foreground border border-border/50 shrink-0">
                                    {coffee.roastLevel}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Factory className="w-4 h-4 opacity-70" />
                                    <span className="truncate">{coffee.roaster}</span>
                                </div>
                                {coffee.origin && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground/90">
                                        <MapPin className="w-4 h-4 opacity-70" />
                                        <span className="truncate">{coffee.origin}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
