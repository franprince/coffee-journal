'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GRINDERS, GrinderId } from '@/lib/grinders';
import { useSettings } from '@/lib/hooks/use-settings';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const t = useTranslations('Settings');
    const { settings, updateGrinder } = useSettings();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-card border-border">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        Customize your Brew Journal experience.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="grinder">Default Grinder</Label>
                        <Select
                            value={settings.preferredGrinder}
                            onValueChange={(val) => updateGrinder(val as GrinderId)}
                        >
                            <SelectTrigger id="grinder" className="bg-secondary/20 border-border/50">
                                <SelectValue placeholder="Select grinder" />
                            </SelectTrigger>
                            <SelectContent className="glass-card">
                                {Object.values(GRINDERS).map((grinder) => (
                                    <SelectItem key={grinder.id} value={grinder.id}>
                                        {grinder.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">
                            This will calculate click estimates in recipes automatically.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
