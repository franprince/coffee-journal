'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GRINDERS, GrinderId } from '@/lib/grinders';
import { useSettings } from '@/lib/hooks/use-settings';
import { usePathname, useRouter } from '@/i18n/routing';
import { Loader2 } from 'lucide-react';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const t = useTranslations('Settings');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const { settings, updateGrinder } = useSettings();

    const [pendingLocale, setPendingLocale] = useState(locale);
    const [pendingGrinder, setPendingGrinder] = useState<GrinderId>(settings.preferredGrinder);
    const [isSaving, setIsSaving] = useState(false);

    // Sync pending states when dialog opens or settings load
    useEffect(() => {
        if (open) {
            setPendingLocale(locale);
            setPendingGrinder(settings.preferredGrinder);
        }
    }, [open, locale, settings.preferredGrinder]);

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Collect promises for concurrent execution if possible
            const promises: Promise<any>[] = [];

            if (pendingGrinder !== settings.preferredGrinder) {
                promises.push(updateGrinder(pendingGrinder));
            }

            // Language transition is usually a redirect, so we handle it last or as part of the flow
            if (pendingLocale !== locale) {
                // If we also updated the grinder, we wait for that first to ensure data consistency
                await Promise.all(promises);
                router.replace(pathname, { locale: pendingLocale });
                // router.replace will likely cause a full page remount, 
                // but we keep the dialog closing logic for safety
                onOpenChange(false);
            } else {
                await Promise.all(promises);
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-card border-border">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Language Settings */}
                    <div className="grid gap-2">
                        <Label htmlFor="language">{t('language')}</Label>
                        <Select
                            value={pendingLocale}
                            onValueChange={setPendingLocale}
                        >
                            <SelectTrigger id="language" className="bg-secondary/20 border-border/50">
                                <SelectValue placeholder={t('languagePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent className="glass-card">
                                <SelectItem value="en">{t('english')}</SelectItem>
                                <SelectItem value="es">{t('spanish')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Grinder Settings */}
                    <div className="grid gap-2">
                        <Label htmlFor="grinder">{t('defaultGrinder')}</Label>
                        <Select
                            value={pendingGrinder}
                            onValueChange={(val) => setPendingGrinder(val as GrinderId)}
                        >
                            <SelectTrigger id="grinder" className="bg-secondary/20 border-border/50">
                                <SelectValue placeholder={t('grinderPlaceholder')} />
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
                            {t('grinderDescription')}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
