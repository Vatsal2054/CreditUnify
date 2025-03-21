"use client"
import { CardWrapper } from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form";
import { Input } from "../ui/input";
import { Resetpass } from "@/actions/auth/reset";
import { useTransition } from "react";
import { toast } from 'sonner'
import { getSchemas } from "@/lib/index";
import { useTranslations } from "next-intl";

export const ResetpasswordForm = () => {
  const t = useTranslations("auth.resetPassword");
  const [isPending, startTransition] = useTransition();
  const { ResetSchema } = getSchemas(t);

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    const loading = toast.loading(t("loadingMessage"));

    startTransition(() => {
      Resetpass(values)
        .then((data) => {
          if (data.error !== undefined) {
            toast.error(t("errorMessage"), { closeButton: true, id: loading });
            console.error(data.error);
          } else {
            toast.success(t("successMessage"), { closeButton: true, id: loading });
            form.reset();
          }
        });
    });
  };

  return (
    <CardWrapper
      headerLabel={t("header")}
      backButtonHref={t("backButton.href")}
      backButtonLable={t("backButton.text")}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("emailLabel")}</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder={t("emailPlaceholder")}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} type='submit' className="w-full">
            {t("submitButton")}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
