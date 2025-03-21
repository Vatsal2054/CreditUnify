"use client"

import { useState } from "react"
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
import { MoreHorizontal, Edit, Trash2, Eye, Building } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// import { deleteUser } from "@/app/actions"
import { toast } from "sonner"

// Bank name enum as provided
enum BankName {
  SBI = "SBI",
  HDFC = "HDFC",
  ICICI = "ICICI",
  AXIS = "AXIS",
  KOTAK = "KOTAK",
  PNB = "PNB",
  BOB = "BOB",
  CANARA = "CANARA",
  IDBI = "IDBI",
  UCO = "UCO",
  BOI = "BOI",
  IOB = "IOB",
  CBI = "CBI",
  SIB = "SIB",
  FEDERAL = "FEDERAL",
  KVB = "KVB",
  LVB = "LVB",
  DBS = "DBS",
  CITI = "CITI",
  HSBC = "HSBC",
  SC = "SC",
  RBL = "RBL",
  YES = "YES",
  INDUSIND = "INDUSIND",
  BANDHAN = "BANDHAN",
  AU = "AU",
  IDFC = "IDFC",
  EQUITAS = "EQUITAS",
  ESAF = "ESAF",
  UJJIVAN = "UJJIVAN",
  SMALLFIN = "SMALLFIN",
  PAYTM = "PAYTM",
  FINCARE = "FINCARE",
  JANA = "JANA",
  NORTHEAST = "NORTHEAST",
  GRAMEEN = "GRAMEEN",
  UTKARSH = "UTKARSH",
  SURYODAY = "SURYODAY",
  JALGAON = "JALGAON",
  AKOLA = "AKOLA",
  KASHI = "KASHI",
  SAMARTH = "SAMARTH",
  KAIJS = "KAIJS",
  KALUPUR = "KALUPUR",
  OTHER = "OTHER"
}

// Updated mock data - all users have BANK role with different bank names
const users = [
  {
    id: "1",
    name: "State Bank of India",
    email: "support@sbi.co.in",
    role: "BANK",
    bankName: BankName.SBI,
    createdAt: "2023-02-15T10:00:00Z",
  },
  {
    id: "2",
    name: "HDFC Bank",
    email: "support@hdfc.com",
    role: "BANK",
    bankName: BankName.HDFC,
    createdAt: "2023-03-10T14:30:00Z",
  },
  {
    id: "3",
    name: "ICICI Bank",
    email: "support@icici.com",
    role: "BANK",
    bankName: BankName.ICICI,
    createdAt: "2023-01-22T09:15:00Z",
  },
  {
    id: "4",
    name: "Axis Bank",
    email: "support@axisbank.com",
    role: "BANK",
    bankName: BankName.AXIS,
    createdAt: "2023-04-05T11:45:00Z",
  },
  {
    id: "5",
    name: "Kotak Mahindra Bank",
    email: "support@kotak.com",
    role: "BANK",
    bankName: BankName.KOTAK,
    createdAt: "2023-05-18T08:30:00Z",
  },
  {
    id: "6",
    name: "Punjab National Bank",
    email: "support@pnb.co.in",
    role: "BANK",
    bankName: BankName.PNB,
    createdAt: "2023-06-20T13:15:00Z",
  },
  {
    id: "7",
    name: "Yes Bank",
    email: "support@yesbank.com",
    role: "BANK",
    bankName: BankName.YES,
    createdAt: "2023-07-12T15:45:00Z",
  },
  {
    id: "8",
    name: "IndusInd Bank",
    email: "support@indusind.com",
    role: "BANK",
    bankName: BankName.INDUSIND,
    createdAt: "2023-08-05T09:30:00Z",
  }
]

export function UserTable() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null)

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
    //   await deleteUser(selectedUser.id)
      toast.success("Bank deleted successfully")
      // Would refresh data here in a real implementation
    } catch (error) {
      console.error("Error deleting bank:", error)
      toast.error("Failed to delete bank")
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Function to get badge color based on bank name
  const getBankBadgeVariant = (bankName: BankName) => {
    switch (bankName) {
      case BankName.SBI:
        return "default" // Blue
      case BankName.HDFC:
        return "destructive" // Red
      case BankName.ICICI:
        return "secondary" // Gray
      case BankName.AXIS:
        return "outline" // Outline
      default:
        return "default" // Blue for others
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bank Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Bank Code</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getBankBadgeVariant(user.bankName)}>
                  {user.bankName}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Bank Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Bank Information
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Building className="mr-2 h-4 w-4" />
                      View Bank Branches
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={() => {
                        setSelectedUser(user)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Bank
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
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}