"use client";

import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

// Mock data for bank activity (credit score checks)
const mockBankActivity = [
  {
    id: "1",
    aadharNumber: "123456789012",
    PAN: "ABCDE1234F",
    score: 750,
    recordedAt: "2025-03-20T14:30:00Z",
  },
  {
    id: "2",
    aadharNumber: "234567890123",
    PAN: "BCDEF2345G",
    score: 810,
    recordedAt: "2025-03-20T12:15:00Z",
  }
];

interface BankActivityTableProps {
  bankId?: string;
  bankName?: string;
}

export function BankActivityTable({ bankId, bankName }: BankActivityTableProps) {
  const t = useTranslations("admin.BankActivityTable");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 750) return "default";
    if (score >= 650) return "secondary";
    return "destructive";
  };

  const maskAadhar = (aadhar: string) => {
    return "XXXX-XXXX-" + aadhar.slice(-4);
  };

  const maskPAN = (pan: string) => {
    return pan.slice(0, 2) + "XXX" + pan.slice(-4);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          {bankName ? t("titleWithBank", { bankName }) : t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("aadhar")}</TableHead>
              <TableHead>{t("pan")}</TableHead>
              <TableHead>{t("creditScore")}</TableHead>
              <TableHead>{t("dateTime")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBankActivity.map((check) => (
              <TableRow key={check.id}>
                <TableCell>{maskAadhar(check.aadharNumber)}</TableCell>
                <TableCell>{maskPAN(check.PAN)}</TableCell>
                <TableCell>
                  <Badge variant={getScoreBadgeVariant(check.score)}>{check.score}</Badge>
                </TableCell>
                <TableCell>{formatDate(check.recordedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
