'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { METHOD_SUGGESTIONS, WATER_SUGGESTIONS } from '@/lib/types';
import type { RecipeFilters } from '@/lib/types';

interface RecipeFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: RecipeFilters;
    onFiltersChange: (filters: RecipeFilters) => void;
    resultCount: number;
    totalCount: number;
}

export function RecipeFiltersComponent({
    searchQuery,
    onSearchChange,
    filters,
    onFiltersChange,
    resultCount,
    totalCount,
}: RecipeFiltersProps) {
    const t = useTranslations('RecipeFilters');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const activeFilterCount =
        filters.methods.length +
        filters.waterTypes.length +
        (filters.grindSizeRange[0] !== 0 || filters.grindSizeRange[1] !== 1400 ? 1 : 0);

    const handleMethodToggle = (method: string) => {
        const newMethods = filters.methods.includes(method)
            ? filters.methods.filter(m => m !== method)
            : [...filters.methods, method];
        onFiltersChange({ ...filters, methods: newMethods });
    };

    const handleWaterTypeToggle = (waterType: string) => {
        const newWaterTypes = filters.waterTypes.includes(waterType)
            ? filters.waterTypes.filter(w => w !== waterType)
            : [...filters.waterTypes, waterType];
        onFiltersChange({ ...filters, waterTypes: newWaterTypes });
    };

    const handleGrindSizeChange = (value: number[]) => {
        onFiltersChange({ ...filters, grindSizeRange: [value[0], value[1]] });
    };

    const clearAllFilters = () => {
        onFiltersChange({
            methods: [],
            waterTypes: [],
            grindSizeRange: [0, 1400],
        });
        onSearchChange('');
    };

    const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0;

    return (
        <div className="space-y-3">
            {/* Search and Filter Controls */}
            <div className="flex gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Popover */}
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2 relative">
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('filters')}</span>
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-coffee-espresso text-coffee-crema text-xs"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">{t('filters')}</h4>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="h-auto p-1 text-xs"
                                    >
                                        {t('clearAll')}
                                    </Button>
                                )}
                            </div>

                            {/* Brew Method Filter */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('brewMethod')}
                                </Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {METHOD_SUGGESTIONS.map((method) => (
                                        <div key={method} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`method-${method}`}
                                                checked={filters.methods.includes(method)}
                                                onCheckedChange={() => handleMethodToggle(method)}
                                            />
                                            <Label
                                                htmlFor={`method-${method}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {method}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Water Type Filter */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('waterType')}
                                </Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {WATER_SUGGESTIONS.map((waterType) => (
                                        <div key={waterType} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`water-${waterType}`}
                                                checked={filters.waterTypes.includes(waterType)}
                                                onCheckedChange={() => handleWaterTypeToggle(waterType)}
                                            />
                                            <Label
                                                htmlFor={`water-${waterType}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {waterType}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Grind Size Filter */}
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('grindSizeRange')}
                                </Label>
                                <div className="px-2">
                                    <Slider
                                        min={0}
                                        max={1400}
                                        step={10}
                                        value={filters.grindSizeRange}
                                        onValueChange={handleGrindSizeChange}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                        <span>{filters.grindSizeRange[0]}µm</span>
                                        <span>{filters.grindSizeRange[1]}µm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Active Filters and Results Count */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                        {t('resultsCount', { count: resultCount, total: totalCount })}
                    </span>

                    {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                            {t('searchLabel')} "{searchQuery}"
                            <button
                                onClick={() => onSearchChange('')}
                                className="ml-1 hover:text-foreground"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    )}

                    {filters.methods.map((method) => (
                        <Badge key={method} variant="secondary" className="gap-1">
                            {method}
                            <button
                                onClick={() => handleMethodToggle(method)}
                                className="ml-1 hover:text-foreground"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}

                    {filters.waterTypes.map((waterType) => (
                        <Badge key={waterType} variant="secondary" className="gap-1">
                            {waterType}
                            <button
                                onClick={() => handleWaterTypeToggle(waterType)}
                                className="ml-1 hover:text-foreground"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}

                    {(filters.grindSizeRange[0] !== 0 || filters.grindSizeRange[1] !== 1400) && (
                        <Badge variant="secondary" className="gap-1">
                            {t('grindLabel')} {filters.grindSizeRange[0]} - {filters.grindSizeRange[1]}µm
                            <button
                                onClick={() => handleGrindSizeChange([0, 1400])}
                                className="ml-1 hover:text-foreground"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
