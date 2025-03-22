import { UserRole } from '@prisma/client';
import * as z from 'zod';


const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$#!%*?&]{8,}$/
)


export const SigninSchema = z.object({
  email:z.string().email({message:"Email is Required"}),
  password:z
    .string()
    .min(8, { message: "password should be minmum 8 characters" })
    .regex(passwordValidation, {
      message:
        "Password should include digits(0-9),special symbols(@,#,&...),Uppercase (A-Z),lowercase(a-z) letters",
    }),
  code:z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email:z.string().email({message:"Email is Required"}),
  password:z.string(),
  name:z.string().min(1,{
    message:"Name is required",
  })
});

export const ResetSchema = z.object({
  email:z.string().email({message:"Email is Required"}),
})

export const NewPasswordSchema = z.object({
  password:z.string().min(6,{message:"Minimum of 6 characters required"}),
  confirmPassword:z.string().min(6,{message:"Minimum of 6 characters required"}),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const SettingsSchema = z.object({
  name:z.optional(z.string()),
  isTwoFactorEnabled:z.optional(z.boolean()),
  email : z.optional(z.string().email()),
  theme: z.optional(z.string()),
  password:z.optional(z.string().min(6,{message:"password shold be of min 6 characters"})),
  newPassword:z.optional(z.string().min(6)),
}) .refine((data)=>{
  if(data.password && !data.newPassword)      return false;

  return true;
},{message:"New password is required!",path:["newPassword"]})
.refine((data)=>{
  if(!data.password && data.newPassword)      return false;
  
  return true;
},{message:"password is required!",path:["password"]})


// Create a function that returns the schemas with translations
export const getSchemas = (t: any) => {
  const passwordValidation = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$#!%*?&]{8,}$/
  )

  const SigninSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, { message: t("auth.validation.password-min") })
      .regex(passwordValidation, {
        message: t("auth.validation.password-regex"),
      }),
    code: z.optional(z.string()),
  })

  const RegisterSchema = z.object({
    email: z.string().email({ message: t("auth.validation.email-empty") }),
    password: z.string(),
    // .min(6,{message:"Password is min 6 length"})
    // .regex(passwordValidation, {
    //   message: t("auth.validation.password-regex"),
    // }),
    name: z.string().min(1, {
      message: t("auth.validation.name-empty"),
    }),
  })

  const ResetSchema = z.object({
    email: z.string().email({ message: t("auth.validation.email-required") }),
  })

  const NewPasswordSchema = z
    .object({
      password: z.string(),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwords-match"),
      path: ["confirmPassword"],
    })

  const SettingsSchema = z.object({
    name: z.optional(z.string()),
    isTwoFactorEnable: z.optional(z.boolean()),
    email: z.optional(z.string().email()),
    password: z.optional(z.string()),
    newPassword: z.optional(z.string()),
    theme: z.optional(z.string()),
  })

  return {
    SigninSchema,
    RegisterSchema,
    ResetSchema,
    NewPasswordSchema,
    SettingsSchema,
  }
}
