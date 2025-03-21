import { LoginForm } from "@/components/auth/login-form"
import { useTranslations } from "next-intl"
import React from "react"

const SigninPage = () => {
  const t = useTranslations();
  return (
    <>
      <h1 className="hidden">{t("auth.spendwise-login")}</h1>
      <LoginForm />
    </>
  )
}

export default SigninPage
