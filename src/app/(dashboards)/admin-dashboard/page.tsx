import { UserAddForm } from "@/components/admin/user-add-form"
import { UserTable } from "@/components/admin/user-table"



export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid gap-8">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Add New User</h2>
            <UserAddForm />
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            <UserTable />
          </div>
        </div>
      </div>
    </div>
  )
}

