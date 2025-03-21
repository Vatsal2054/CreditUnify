"use client";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CardWrapper } from "./card-wrapper";
import { BeatLoader } from "react-spinners";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/auth/new-verification";
import { FormError } from "./form-error";
import { FromSuccess } from "./form-success";

export const NewVerificationForm = () => {
  const t = useTranslations("auth.verification");
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError(t("missingToken"));
      return;
    }
    newVerification(token)
      .then((data) => {
        if (data.error) setError(data.error);
        else setSuccess(data.success);
      })
      .catch(() => {
        setError(t("errorGeneral"));
      });
  }, [token, success, error, t]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel={t("header")}
      backButtonHref="/auth/signin"
      backButtonLable={t("back")}
    >
      <div className="flex items-center justify-center w-full h-6 mb-4 mt-2">
        {!success && !error && <BeatLoader />}
        {!success && error && <FormError message={error} key={error} />}
        {success && <FromSuccess message={success} key={success} />}
      </div>
    </CardWrapper>
  );
};
