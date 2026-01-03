import { WithdrawalsController } from "@/server/controllers/withdrawals.controller";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "./columns";

export default async function WithdrawalsPage() {
    const withdrawals = await WithdrawalsController.getAll();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Historique des retraits des agences</h2>
            </div>
            <DataTable columns={columns} data={withdrawals as any} searchKey="status" />
        </div>
    );
}
