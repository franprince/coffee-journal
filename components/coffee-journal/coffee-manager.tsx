'use client';

import { useState } from 'react';
import { Plus, Bean, MapPin, Factory } from 'lucide-react';
import type { Coffee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CoffeeManagerProps {
    coffees: Coffee[];
    onAddCoffee: (coffee: Coffee) => void;
}

export function CoffeeManager({ coffees, onAddCoffee }: CoffeeManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newCoffee, setNewCoffee] = useState<Partial<Coffee>>({
        name: '',
        roaster: '',
        roastLevel: 'medium',
        origin: '',
        process: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const coffee: Coffee = {
            id: crypto.randomUUID(),
            name: newCoffee.name || 'Unknown Coffee',
            roaster: newCoffee.roaster || 'Unknown Roaster',
            roastLevel: (newCoffee.roastLevel as any) || 'medium',
            origin: newCoffee.origin,
            process: newCoffee.process,
            notes: newCoffee.notes,
        };
        onAddCoffee(coffee);
        setIsOpen(false);
        setNewCoffee({ name: '', roaster: '', roastLevel: 'medium', origin: '', process: '', notes: '' });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif text-foreground flex items-center gap-2">
                    <Bean className="w-5 h-5 text-primary" />
                    My Coffee Beans
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Coffee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Coffee</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Ethiopia Yirgacheffe"
                                    value={newCoffee.name}
                                    onChange={(e) => setNewCoffee({ ...newCoffee, name: e.target.value })}
                                    required
                                    className="bg-background/50 border-input"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roaster">Roaster</Label>
                                    <Input
                                        id="roaster"
                                        placeholder="e.g. Onyx"
                                        value={newCoffee.roaster}
                                        onChange={(e) => setNewCoffee({ ...newCoffee, roaster: e.target.value })}
                                        required
                                        className="bg-background/50 border-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roastLevel">Roast Level</Label>
                                    <Select
                                        value={newCoffee.roastLevel}
                                        onValueChange={(val) => setNewCoffee({ ...newCoffee, roastLevel: val as any })}
                                    >
                                        <SelectTrigger className="bg-background/50 border-input">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                <Label htmlFor="origin">Origin <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                <Input
                                    id="origin"
                                    placeholder="e.g. Gedeb"
                                    value={newCoffee.origin}
                                    onChange={(e) => setNewCoffee({ ...newCoffee, origin: e.target.value })}
                                    className="bg-background/50 border-input"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-coffee-espresso text-coffee-crema hover:bg-coffee-espresso/90">
                                Save To Inventory
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {coffees.map((coffee) => (
                    <div
                        key={coffee.id}
                        className="glass-card p-3 rounded-lg border border-border/50 hover:bg-secondary/20 transition-colors flex flex-col gap-1"
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-medium text-foreground text-sm">{coffee.name}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                                {coffee.roastLevel}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Factory className="w-3 h-3" />
                            {coffee.roaster}
                        </div>
                        {coffee.origin && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {coffee.origin}
                            </div>
                        )}
                        {coffee.process && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className='w-3 h-3 block text-center'>⚙️</span>
                                {coffee.process}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
