import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ThumbnailProps {
  pdfDocument: any;
  pageNum: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const PdfThumbnail = ({
  pdfDocument,
  pageNum,
  isSelected,
  onClick,
}: ThumbnailProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pdfDocument || !containerRef.current) return;

    let renderTask: any = null;
    let canvas: HTMLCanvasElement | null = null;

    (async () => {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.2 });

        // Ensure container is still mounted
        if (!containerRef.current) return;

        // Create new canvas
        canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.display = "block"; // prevents extra space

        // Clear previous content
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(canvas);

        const context = canvas.getContext("2d");
        if (!context) return;

        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name === "RenderingCancelledException") return;
        console.error(`Thumbnail render error (page ${pageNum}):`, err);
      }
    })();

    return () => {
      renderTask?.cancel();
      // Cleanup: remove canvas if it exists (though innerHTML="" handles it next run)
      if (canvas && containerRef.current && containerRef.current.contains(canvas)) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, [pdfDocument, pageNum]);

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer group flex flex-col items-center gap-2 transition-all p-2 rounded-lg border-2",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-transparent hover:bg-slate-100"
      )}
    >
      <div className="relative shadow-sm bg-white overflow-hidden rounded-sm border border-slate-200">
        <div ref={containerRef} className="min-h-[100px] flex items-center justify-center bg-slate-50" />
      </div>
      <span
        className={cn(
          "text-xs font-medium",
          isSelected ? "text-primary" : "text-slate-500"
        )}
      >
        Page {pageNum}
      </span>
    </div>
  );
}
