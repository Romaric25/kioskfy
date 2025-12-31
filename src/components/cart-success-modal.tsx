"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { priceFormatter } from "@/lib/price-formatter";

interface CartSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    newspaper: {
        coverImage: string;
        issueNumber: string;
        organization?: {
            name: string;
        } | null;
        price: string | number;
    };
    onContinueShopping: () => void;
}

export function CartSuccessModal({
    open,
    onOpenChange,
    newspaper,
    onContinueShopping,
}: CartSuccessModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center sm:text-center">
                    <div className="mx-auto mb-4 relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4 shadow-lg shadow-green-500/30">
                            <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-bold text-center">
                        Ajouté au panier !
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        L&apos;article a bien été ajouté à votre panier.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md border shadow-sm">
                        <img
                            src={newspaper.coverImage}
                            alt={newspaper.issueNumber}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{newspaper.issueNumber}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                            {newspaper.organization?.name}
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">
                            {priceFormatter(newspaper.price)}
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onContinueShopping}
                    >
                        Continuer vos achats
                    </Button>
                    <Button asChild className="flex-1">
                        <Link href="/cart">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Voir le panier
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
