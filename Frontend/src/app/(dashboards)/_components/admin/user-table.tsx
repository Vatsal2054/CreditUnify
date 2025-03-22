"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Eye, Building, Activity } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { BankActivityTable } from "./BankActivityTable"

// Bank name enum as provided
enum BankName {
  SBI = "SBI",
  HDFC = "HDFC",
  ICICI = "ICICI",
  AXIS = "AXIS",
  KOTAK = "KOTAK",
  PNB = "PNB",
  OTHER = "OTHER"
}

// Mock Data
const users = [
  {
    id: "1",
    name: "State Bank of India",
    email: "support@sbi.co.in",
    role: "BANK",
    bankName: BankName.SBI,
    createdAt: "2023-02-15T10:00:00Z",
    lastActive: "2025-03-21T08:23:00Z",
  }
]

export function UserTable() {
  const t = useTranslations("admin.UserTable")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null)

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      toast.success("Bank deleted successfully")
    } catch (error) {
      toast.error("Failed to delete bank")
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("bankName")}</TableHead>
            <TableHead>{t("email")}</TableHead>
            <TableHead>{t("bankCode")}</TableHead>
            <TableHead>{t("created")}</TableHead>
            <TableHead>{t("lastActive")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge>{user.bankName}</Badge>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(user.lastActive).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      {t("viewBankDetails")}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("editBankInfo")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedUser(user)
                      setActivityDialogOpen(true)
                    }}>
                      <Activity className="mr-2 h-4 w-4" />
                      {t("viewRecentActivity")}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Building className="mr-2 h-4 w-4" />
                      {t("viewBankBranches")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={() => {
                        setSelectedUser(user)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("deleteBank")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDeletion")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirmationMessage", { name: selectedUser?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>{t("recentActivity", { name: selectedUser?.name ?? "" })}</DialogTitle>
            <DialogDescription>
              {t("recentActivityDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <BankActivityTable bankId={selectedUser?.id} bankName={selectedUser?.name} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
