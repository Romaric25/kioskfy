
import { NewspaperPdfViewer } from "@/components/view-newspaper-pdf";

export default function RenderPage() {
    return (
        <div className="flex-1 space-y-4">
            <NewspaperPdfViewer back="/admin/newspapers"/>
        </div>
    );
}