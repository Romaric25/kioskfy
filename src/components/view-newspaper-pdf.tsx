"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { useAuth } from "@/hooks/use-auth.hook";
import { useNewspaper, fetchPdfToken } from "@/hooks/use-newspapers.hook";

import { useSelectedNewspaperStore } from "@/stores/use-newspaper.store";
import { PdfThumbnail } from "@/components/pdf-thumbnail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { PanelLeftClose, PanelLeft, ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/helpers";

type Props = { scale?: number };

// --- PDF Page Component ---
interface PdfPageProps {
    pdfDocument: any;
    pageNum: number;
    scale: number;
    watermark?: string;
    onInView: (pageNum: number) => void;
}

const PdfPage = memo(({ pdfDocument, pageNum, scale, watermark, onInView }: PdfPageProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);
    const [isRendered, setIsRendered] = useState(false);

    // Intersection Observer to detect visibility
    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    onInView(pageNum);
                    // Trigger render if not already rendered
                    if (!isRendered) {
                        setIsRendered(true);
                    }
                }
            },
            {
                root: null, // viewport
                rootMargin: "200px", // precache slightly before view
                threshold: 0.1,
            }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [pageNum, onInView, isRendered]);

    // Render Logic
    useEffect(() => {
        if (!isRendered || !pdfDocument || !canvasRef.current) return;

        let cancelled = false;

        (async () => {
            try {
                const page = await pdfDocument.getPage(pageNum);
                if (cancelled) return;

                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;

                if (!canvas) return;
                const context = canvas.getContext("2d");
                if (!context) return;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Handle watermark styles dynamically based on viewport
                // canvas.style.width = "100%"; // Removed to respect scale and fit container
                // canvas.style.height = "auto";

                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel();
                }

                const renderTask = page.render({ canvasContext: context, viewport });
                renderTaskRef.current = renderTask;
                await renderTask.promise;
            } catch (err: any) {
                if (err?.name === "RenderingCancelledException") return;
                console.error(`Error rendering page ${pageNum}:`, err);
            }
        })();

        return () => {
            cancelled = true;
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }
        };
    }, [isRendered, pdfDocument, pageNum, scale]);

    return (
        <div
            ref={containerRef}
            className="my-4 relative bg-white shadow-md mx-auto transition-all duration-200"
            style={{
                minHeight: isRendered ? 'auto' : Math.max(500, 800 * scale * 0.5) + 'px',
                width: 'fit-content',
            }}
        >
            <canvas ref={canvasRef} className="block shadow-sm" />
            {watermark && isRendered && (
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-50"
                >
                    <span
                        className="opacity-15 font-bold text-black whitespace-nowrap"
                        style={{ fontSize: "2rem", transform: "rotate(-45deg)" }}
                    >
                        {watermark}
                    </span>
                </div>
            )}
        </div>
    );
});
PdfPage.displayName = "PdfPage";

// --- Main Viewer Component ---

export const NewspaperPdfViewer = ({ scale = 0.60 }: Props) => { // slightly larger default scale
    const rootRef = useRef<HTMLDivElement>(null); // New Root Ref
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentScale, setCurrentScale] = useState(scale);
    const [isWindowFocused, setIsWindowFocused] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state
    const [isDoublePage, setIsDoublePage] = useState(false); // Double page mode toggle
    const [pageInput, setPageInput] = useState("1"); // For the input field

    // PDF State
    const [pdfDocument, setPdfDocument] = useState<any>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [activePage, setActivePage] = useState<number>(1);

    // Page refs for scrolling (now mapping directly to DOM ids)

    const { selectedNewspaperId } = useSelectedNewspaperStore();
    const { newspaper } = useNewspaper(selectedNewspaperId as string);
    const { user } = useAuth();

    const agencyName = newspaper?.organization?.name;
    const watermark = agencyName ? `${agencyName} sur KIOSKFY.COM` : "KIOSKFY.COM";

    // Update input when active page changes (e.g. scrolling)
    useEffect(() => {
        setPageInput(activePage.toString());
    }, [activePage]);

    // Zoom Handlers
    const handleZoomIn = () => setCurrentScale(prev => Math.min(prev + 0.2, 3.0));
    const handleZoomOut = () => setCurrentScale(prev => Math.max(prev - 0.2, 0.5));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            rootRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const toggleDoublePage = () => {
        setIsDoublePage(!isDoublePage);
        // Reset scale appropriately when switching modes might be good UX, but keeping user choice for now
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Focus Handlers for Screenshot Prevention
    useEffect(() => {
        const onFocus = () => setIsWindowFocused(true);
        const onBlur = () => setIsWindowFocused(false);

        // Check initial state
        if (!document.hasFocus()) setIsWindowFocused(false);

        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);
        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
        };
    }, []);

    // Load PDF
    useEffect(() => {
        if (!selectedNewspaperId || !user) return;
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const pdfjs = await import("pdfjs-dist");
                if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
                }

                const token = await fetchPdfToken(selectedNewspaperId);
                if (!token) throw new Error("Token generation failed");

                const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
                const url = `${baseUrl}/api/v1/newspapers/${selectedNewspaperId}/view?token=${encodeURIComponent(token)}`;

                const loadingTask = pdfjs.getDocument({ url, withCredentials: true });
                const pdf = await loadingTask.promise;

                if (!cancelled) {
                    setPdfDocument(pdf);
                    setNumPages(pdf.numPages);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("PDF Load Error:", err);
                    setError("Impossible de charger le document.");
                    setLoading(false);
                }
            }
        })();

        return () => { cancelled = true; };
    }, [selectedNewspaperId, user]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            // Block Print (Ctrl+P, Cmd+P)
            if ((e.ctrlKey || e.metaKey) && e.key === "p") {
                e.preventDefault();
            }
            // Block generic Screenshot keys if possible (PrintScreen)
            if (e.key === "PrintScreen") {
                e.preventDefault();
                // We can't actually stop the OS, but we can try to hide content momentarily or flash?
                // For now, relies on blur.
                setIsWindowFocused(false);
                setTimeout(() => setIsWindowFocused(true), 1000); // Blink blur
            }
        };
        const handleContext = (e: MouseEvent) => e.preventDefault();

        window.addEventListener("keydown", handleKeys);
        window.addEventListener("contextmenu", handleContext);
        return () => {
            window.removeEventListener("keydown", handleKeys);
            window.removeEventListener("contextmenu", handleContext);
        };
    }, []);

    const scrollToPage = (pageNum: number) => {
        const targetPage = Math.max(1, Math.min(pageNum, numPages));
        setActivePage(targetPage); // Update active state immediately
        // In double page mode, we might need to scroll to the spread containing the page
        const element = document.getElementById(`pdf-page-${targetPage}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handlePageInView = useCallback((pageNum: number) => {
        setActivePage(pageNum);
    }, []);

    // Generate spreads for rendering
    const spreads = React.useMemo(() => {
        if (!isDoublePage) {
            // Single page mode: e.g. [[1], [2], [3], [4]]
            return Array.from({ length: numPages }, (_, i) => [i + 1]);
        }

        // Double page mode: e.g. [[1], [2, 3], [4, 5]]
        const result: number[][] = [];
        if (numPages > 0) {
            result.push([1]); // Cover always alone
            for (let i = 2; i <= numPages; i += 2) {
                if (i + 1 <= numPages) {
                    result.push([i, i + 1]);
                } else {
                    result.push([i]); // Last page alone if odd count
                }
            }
        }
        return result;
    }, [numPages, isDoublePage]);

    const handlePrevPage = () => {
        if (activePage <= 1) return;
        const currentSpreadIndex = spreads.findIndex(s => s.includes(activePage));
        if (currentSpreadIndex > 0) {
            scrollToPage(spreads[currentSpreadIndex - 1][0]);
        } else {
            scrollToPage(activePage - 1);
        }
    };

    const handleNextPage = () => {
        if (activePage >= numPages) return;
        const currentSpreadIndex = spreads.findIndex(s => s.includes(activePage));
        if (currentSpreadIndex !== -1 && currentSpreadIndex < spreads.length - 1) {
            scrollToPage(spreads[currentSpreadIndex + 1][0]);
        } else {
            scrollToPage(activePage + 1);
        }
    };

    const handlePageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(pageInput);
        if (!isNaN(page) && page >= 1 && page <= numPages) {
            scrollToPage(page);
        } else {
            setPageInput(activePage.toString()); // Reset on invalid
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h3 className="font-semibold text-lg">Erreur</h3>
                    <p className="text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef} className="flex h-screen w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <div className={cn(
                "bg-muted/50 border-r flex flex-col h-full transition-all duration-300 overflow-hidden",
                sidebarOpen ? "w-64" : "w-0"
            )}>
                <div className="p-4 border-b bg-background min-w-64">
                    <div className="mb-4">
                        <Link href="/organization/dashboard/newspapers">
                            <Button variant="outline" className="w-full gap-2 justify-start">
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 min-w-64">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                        <PdfThumbnail
                            key={pageNum}
                            pdfDocument={pdfDocument}
                            pageNum={pageNum}
                            isSelected={activePage === pageNum}
                            onClick={() => scrollToPage(pageNum)}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-muted/20 flex flex-col relative overflow-hidden">
                <header className="h-auto min-h-14 py-2 border-b bg-background/95 backdrop-blur flex flex-wrap items-center px-4 gap-2 z-10 shrink-0 justify-between sm:justify-start">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                    </Button>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-1 order-2 sm:order-none w-full sm:w-auto justify-center sm:justify-start mt-2 sm:mt-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevPage} disabled={activePage <= 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <form onSubmit={handlePageSubmit} className="flex items-center gap-1 mx-1">
                            <Input
                                className="h-8 w-12 px-1 text-center"
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                onBlur={() => setPageInput(activePage.toString())}
                            />
                            <span className="text-sm text-muted-foreground w-10">/ {numPages}</span>
                        </form>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextPage} disabled={activePage >= numPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="hidden sm:block w-px h-6 bg-border mx-2" />

                    <div className="flex items-center gap-1 bg-muted/50 rounded-md border p-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} disabled={currentScale <= 0.5}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs w-10 text-center font-medium tabular-nums hidden sm:inline-block">{Math.round(currentScale * 100)}%</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} disabled={currentScale >= 3.0}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 bg-muted/50 rounded-md border p-0.5 ml-2">
                        <Button
                            variant={isDoublePage ? "secondary" : "ghost"}
                            size="sm"
                            onClick={toggleDoublePage}
                            className="text-xs gap-2 px-2 h-8"
                            title={isDoublePage ? "Vue simple" : "Vue double page"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-book-open"
                            >
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                            </svg>
                            <span className="hidden sm:inline">{isDoublePage ? "Double" : "Simple"}</span>
                        </Button>
                    </div>

                    <div className="flex-1 font-medium text-sm truncate ml-4 hidden md:flex items-center justify-center gap-3">
                        {newspaper?.organization?.logo && (
                            <div className="relative h-9 w-9 rounded-full overflow-hidden border bg-background shrink-0 shadow-sm">
                                <Image
                                    src={newspaper.organization.logo}
                                    alt={agencyName || "Agency Logo"}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="flex flex-col items-start leading-tight">
                            <span className="truncate">{agencyName} <span className="text-muted-foreground mx-1">•</span> N°{newspaper?.issueNumber}</span>
                            {newspaper?.publishDate && (
                                <span className="text-xs text-muted-foreground font-normal">
                                    Publié le {formatDate(newspaper.publishDate, undefined, "d MMMM yyyy")}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 ml-auto">
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center">
                    <div className="flex flex-col items-center gap-4 pb-10">
                        {spreads.map((spread, index) => (
                            <div
                                key={`spread-${index}`}
                                className={cn(
                                    "flex justify-center items-center transition-all duration-300",
                                    isDoublePage && spread.length > 1 ? "gap-4" : ""
                                )}
                            >
                                {spread.map((pageNum) => (
                                    <div key={pageNum} id={`pdf-page-${pageNum}`} className="relative">
                                        <PdfPage
                                            pdfDocument={pdfDocument}
                                            pageNum={pageNum}
                                            scale={currentScale}
                                            watermark={watermark}
                                            onInView={handlePageInView}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
