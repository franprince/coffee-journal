#!/usr/bin/env bun

/**
 * Script to analyze component usage in the Coffee Journal app
 * Identifies unused UI components and potentially unused coffee-journal components
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const UI_COMPONENTS_DIR = 'components/ui';
const COFFEE_JOURNAL_COMPONENTS_DIR = 'components/coffee-journal';

function getComponentFiles(dir: string): string[] {
    return readdirSync(dir)
        .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
        .map(file => file.replace(/\.(tsx|ts)$/, ''));
}

function checkImportUsage(componentName: string, componentPath: string): number {
    try {
        const result = execSync(
            `grep -r "from [\"']@/${componentPath}/${componentName}[\"']" --include="*.tsx" --include="*.ts" . | wc -l`,
            { encoding: 'utf-8', cwd: process.cwd() }
        );
        return parseInt(result.trim(), 10);
    } catch {
        return 0;
    }
}

console.log('🔍 Analyzing UI Components...\n');

const uiComponents = getComponentFiles(UI_COMPONENTS_DIR);
const unusedUiComponents: string[] = [];

uiComponents.forEach(component => {
    const usageCount = checkImportUsage(component, 'components/ui');

    if (usageCount === 0) {
        unusedUiComponents.push(component);
    }
});

console.log('📦 Unused UI Components:');
if (unusedUiComponents.length === 0) {
    console.log('  ✅ All UI components are in use');
} else {
    unusedUiComponents.forEach(comp => {
        console.log(`  ❌ ${comp}.tsx`);
    });
}

console.log('\n🔍 Analyzing Coffee Journal Components...\n');

const coffeeComponents = getComponentFiles(COFFEE_JOURNAL_COMPONENTS_DIR);
const unusedCoffeeComponents: string[] = [];

coffeeComponents.forEach(component => {
    const usageCount = checkImportUsage(component, 'components/coffee-journal');

    if (usageCount === 0) {
        unusedCoffeeComponents.push(component);
    }
});

console.log('📦 Unused Coffee Journal Components:');
if (unusedCoffeeComponents.length === 0) {
    console.log('  ✅ All coffee journal components are in use');
} else {
    unusedCoffeeComponents.forEach(comp => {
        console.log(`  ❌ ${comp}.tsx`);
    });
}

console.log('\n📊 Summary:');
console.log(`  Total UI Components: ${uiComponents.length}`);
console.log(`  Unused UI Components: ${unusedUiComponents.length}`);
console.log(`  Total Coffee Journal Components: ${coffeeComponents.length}`);
console.log(`  Unused Coffee Journal Components: ${unusedCoffeeComponents.length}`);
