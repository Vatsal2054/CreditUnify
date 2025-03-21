"use client";

import { useSearchParams } from "next/navigation";
import { BackButton } from "./back-button";
import { Header } from "./header";
import {
  Card,
  CardFooter,
  CardHeader,
  CardContent
} from "@/components/ui/card";
import { FormError } from "./form-error";
import { useTranslations } from "next-intl";

export const ErrorCard = () => {
  const t = useTranslations("auth.error"); // Updated translation path
  const searchParams = useSearchParams();
  const value = searchParams.get("error");

  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header lable={t("title")} />
      </CardHeader>
      <CardContent>
        {value === "Configuration" && (
          <FormError message={t("errors.configuration")} />
        )}
      </CardContent>
      <CardFooter>
        <BackButton lable={t("backButton")} href="/auth/signin" />
      </CardFooter>
    </Card>
  );
};
