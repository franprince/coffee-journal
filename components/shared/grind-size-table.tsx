'use client';

import { useTranslations } from 'next-intl';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useSettings } from '@/lib/hooks/use-settings';
import { micronsToClicks, GRINDERS } from '@/lib/grinders';

export function GrindSizeTable() {
    const t = useTranslations('GrindSizeTable');
    const { settings } = useSettings();
    const grinderName = GRINDERS[settings.preferredGrinder]?.name || 'Grinder';

    const data = [
        { method: 'turkish', microns: 130, range: '40-220', texture: 'powder' },
        { method: 'espresso', microns: 280, range: '180-380', texture: 'fineSalt' },
        { method: 'mokaPot', microns: 510, range: '360-660', texture: 'sand' },
        { method: 'aeropress', microns: 640, range: '320-960', texture: 'tableSalt' },
        { method: 'v60', microns: 550, range: '400-700', texture: 'seaSalt' },
        { method: 'pourOver', microns: 670, range: '410-930', texture: 'kosherSalt' },
        { method: 'chemex', microns: 750, range: '500-1000', texture: 'coarseSalt' },
        { method: 'frenchPress', microns: 995, range: '690-1300', texture: 'breadcrumbs' },
        { method: 'coldBrew', microns: 1200, range: '1000+', texture: 'rockSalt' },
    ];

    return (
        <div className="w-full overflow-hidden rounded-md border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[30%]">{t('method')}</TableHead>
                        <TableHead className="w-[25%]">{t('microns')}</TableHead>
                        <TableHead className="w-[25%]">{grinderName}</TableHead>
                        <TableHead className="w-[20%] text-right">{t('texture')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.method} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{t(`methods.${row.method}`)}</TableCell>
                            <TableCell className="font-mono text-xs">{row.range}µm</TableCell>
                            <TableCell className="font-mono text-xs text-primary font-semibold">
                                {micronsToClicks(row.microns, settings.preferredGrinder)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-[10px]">{t(`textures.${row.texture}`)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
