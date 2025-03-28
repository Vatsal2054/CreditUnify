
"use client";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CardWrapper } from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { newPassword } from "@/actions/auth/new-password";
import { getSchemas } from "@/lib/index";
import { useCallback, useState, useTransition } from "react";
import zxcvbn from "zxcvbn";
import { Passwordcmp } from "../Passwordcmp";

export const NewResetPasswordForm = () => {
  const t = useTranslations("auth.newPassword");
  const [isPending, startTransition] = useTransition();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { NewPasswordSchema } = getSchemas(t);

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    const loading = toast.loading(t("loadingMessage"));
    startTransition(() => {
      newPassword(values, token).then((data) => {
        if (data.error) {
          toast.error(t("errorMessage"), {
            closeButton: true,
            id: loading,
          });
          console.error(data.error);
        } else {
          toast.success(t("successMessage"), {
            closeButton: true,
            id: loading,
          });
          form.reset();
        }
      });
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const result = zxcvbn(password);
    setPasswordStrength({
      score: result.score,
      feedback: result.feedback.warning || result.feedback.suggestions[0] || "",
    });
  };

  const getPasswordStrengthColor = useCallback(() => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  }, [passwordStrength.score]);

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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("passwordLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder={t("passwordPlaceholder")}
                      type={isPasswordVisible ? "text" : "password"}
                      onChange={(e) => {
                        field.onChange(e);
                        handlePasswordChange(e);
                      }}
                      disabled={isPending}
                      className="pr-10"
                    />
                    <Passwordcmp
                      isPasswordVisible={isPasswordVisible}
                      setisPasswordVisible={setIsPasswordVisible}
                    />
                  </div>
                </FormControl>
                {field.value && (
                  <div className="mt-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1">{passwordStrength.feedback}</p>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("confirmPasswordLabel")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder={t("confirmPasswordPlaceholder")}
                      type={isPasswordVisible ? "text" : "password"}
                      disabled={isPending}
                      className="pr-10"
                    />
                    <Passwordcmp
                      isPasswordVisible={isPasswordVisible}
                      setisPasswordVisible={setIsPasswordVisible}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit" className="w-full">
            {t("submitButton")}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
