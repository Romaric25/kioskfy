import { UsersController } from "@/server/controllers/users.controller";
import { DataTable } from "@/components/admin/data-table";
import { columns, UserTableData } from "./columns";

export default async function UsersPage() {
    const result = await UsersController.getAll();

    if (!result.success || !result.data) {
        return <div>Failed to load users</div>;
    }

    const users: UserTableData[] = result.data.map((user: any) => ({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        phone: user.phone,
        typeUser: user.typeUser,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Utilisateurs</h2>
            </div>
            <DataTable columns={columns} data={users} searchKey="email" />
        </div>
    );
}
