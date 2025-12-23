
import { NewspapersList } from "@/components/labo/newspapers-list";

export default function NewspapersPage() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Mes Journaux</h2>
            </div>
            <NewspapersList />
        </div>
    );
}