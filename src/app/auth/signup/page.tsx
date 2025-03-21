import { RegisterForm } from "@/components/auth/regester-form"
import React from "react"
import { useTranslations } from "next-intl"

const Home = () => {
  const t = useTranslations();
  
  return (
    <>
      <h1 className="hidden">{t("auth.spendwise-register")}</h1>
      <RegisterForm />
    </>
  )
}

export default Home