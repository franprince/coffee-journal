'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GRINDERS, GrinderId } from '@/lib/grinders';
import { useSettings } from '@/lib/hooks/use-settings';
import { usePathname, useRouter } from '@/i18n/routing';

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

    const handleLanguageChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

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
                    {/* Language Settings */}
                    <div className="grid gap-2">
                        <Label htmlFor="language">{t('language')}</Label>
                        <Select
                            value={locale}
                            onValueChange={handleLanguageChange}
                        >
                            <SelectTrigger id="language" className="bg-secondary/20 border-border/50">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent className="glass-card">
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Grinder Settings */}
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
