'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { AddCoffeeForm } from '@/components/coffee';
import type { Coffee } from '@/lib/types';
import { useState } from 'react';

interface CoffeeSelectorProps {
    coffees: Coffee[];
    selectedCoffeeId: string;
    onSelectCoffee: (id: string) => void;
    onAddCoffee: (coffee: Coffee) => void;
}

export function CoffeeSelector({
    coffees,
    selectedCoffeeId,
    onSelectCoffee,
    onAddCoffee
}: CoffeeSelectorProps) {
    const t = useTranslations('BrewLogForm');
    const [isAddCoffeeOpen, setIsAddCoffeeOpen] = useState(false);

    return (
        <div className="max-w-[240px] mx-auto flex items-center gap-2">
            <Select value={selectedCoffeeId} onValueChange={onSelectCoffee}>
                <SelectTrigger className="h-8 text-xs bg-secondary/20 border-border/50 flex-1">
                    <SelectValue placeholder={t('selectCoffee')} />
                </SelectTrigger>
                <SelectContent className="glass-card">
                    {coffees.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                            {c.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Dialog open={isAddCoffeeOpen} onOpenChange={setIsAddCoffeeOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 shrink-0 bg-secondary/20 border-border/50 hover:bg-secondary/40"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="glass-card border-border sm:max-w-[425px]"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="sr-only">{t('addCoffee')}</DialogTitle>
                    </DialogHeader>
                    <AddCoffeeForm
                        onSubmit={async (coffee) => {
                            onAddCoffee(coffee);
                            onSelectCoffee(coffee.id);
                            setIsAddCoffeeOpen(false);
                        }}
                        defaultName={`Coffee Bean #${coffees.length + 1}`}
                        onCancel={() => setIsAddCoffeeOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
