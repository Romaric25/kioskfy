"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Construction } from "lucide-react"

export function ConstructionAlert() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Vérifie si l'utilisateur a déjà vu le message durant cette session
        const hasSeenAlert = sessionStorage.getItem("construction-alert-seen")

        if (!hasSeenAlert) {
            // Petit délai pour une apparition fluide après le chargement initial
            const timer = setTimeout(() => {
                setOpen(true)
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setOpen(false)
       // sessionStorage.setItem("construction-alert-seen", "true")
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md border-orange-500/20 shadow-2xl">
                <DialogHeader className="flex flex-col items-center gap-4 py-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                        <Construction className="h-8 w-8 text-orange-600 dark:text-orange-500" />
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            Site en construction
                        </DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground max-w-[300px]">
                            Nous travaillons activement à l'amélioration de
                            <span className="font-semibold text-foreground mx-1">Kioskfy</span>.
                            Certaines fonctionnalités peuvent être limitées ou en cours de développement.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <div className="flex flex-col gap-2 bg-muted/40 p-4 rounded-lg text-sm text-center">
                    <p>🚧 Prochaine mise à jour prévue : <strong>Bientôt</strong></p>
                    <p>Merci de votre patience et de votre soutien !</p>
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleClose}
                        className="w-full sm:w-auto min-w-[150px] bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        J'ai compris, visiter le site
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
