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

export function GrindSizeTable() {
    const t = useTranslations('GrindSizeTable');

    const data = [
        { method: 'turkish', microns: '40-220', clicks: '5-10', texture: 'powder' },
        { method: 'espresso', microns: '180-380', clicks: '7-12', texture: 'fineSalt' },
        { method: 'mokaPot', microns: '360-660', clicks: '12-18', texture: 'sand' },
        { method: 'aeropress', microns: '320-960', clicks: '15-25', texture: 'tableSalt' },
        { method: 'v60', microns: '400-700', clicks: '18-28', texture: 'seaSalt' },
        { method: 'pourOver', microns: '410-930', clicks: '20-30', texture: 'kosherSalt' },
        { method: 'chemex', microns: '500-1000', clicks: '25-30', texture: 'coarseSalt' },
        { method: 'frenchPress', microns: '690-1300', clicks: '25-35', texture: 'breadcrumbs' },
        { method: 'coldBrew', microns: '1000+', clicks: '30-45', texture: 'rockSalt' },
    ];

    return (
        <div className="w-full overflow-hidden rounded-md border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[30%]">{t('method')}</TableHead>
                        <TableHead className="w-[25%]">{t('microns')}</TableHead>
                        <TableHead className="w-[20%]">C40 (Clicks)</TableHead>
                        <TableHead className="w-[25%] text-right">{t('texture')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.method} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{t(`methods.${row.method}`)}</TableCell>
                            <TableCell className="font-mono text-xs">{row.microns}µm</TableCell>
                            <TableCell className="font-mono text-xs text-primary font-semibold">{row.clicks}</TableCell>
                            <TableCell className="text-right text-muted-foreground text-xs">{t(`textures.${row.texture}`)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
