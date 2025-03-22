import { UserAddForm } from "../_components/admin/user-add-form"
import { UserTable } from "../_components/admin/user-table"
import { DashboardStats } from "../_components/admin/DashboardStats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankActivityTable } from "../_components/admin/BankActivityTable"
import { useTranslations } from "next-intl"

export default function AdminDashboardPage() {
  const t = useTranslations("admin.AdminDashboardPage")

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <DashboardStats />
      
      <Tabs defaultValue="banks" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="banks">{t("tabs.banks")}</TabsTrigger>
          <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
          <TabsTrigger value="add">{t("tabs.add")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="banks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("bankManagement.title")}</CardTitle>
              <CardDescription>{t("bankManagement.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("systemActivity.title")}</CardTitle>
              <CardDescription>{t("systemActivity.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <BankActivityTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("addBank.title")}</CardTitle>
              <CardDescription>{t("addBank.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <UserAddForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
