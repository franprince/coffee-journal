'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { CoffeeLoader } from '@/components/ui/coffee-loader';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading = false,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="glass-card border-border sm:max-w-[400px] animate-in zoom-in-95 duration-200">
                <DialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-xl font-display font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-3 sm:gap-0 mt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-xl h-11 font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 rounded-xl h-11 font-bold shadow-lg shadow-destructive/20"
                    >
                        {isLoading ? (
                            <CoffeeLoader className="w-4 h-4 mr-2" />
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
