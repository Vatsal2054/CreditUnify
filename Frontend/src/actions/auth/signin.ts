"use server"
import { signIn } from "@/auth"
import * as z from "zod"
import { DEFAULT_LOGIN_REDIRECT_ADMIN, DEFAULT_LOGIN_REDIRECT_BANK, DEFAULT_LOGIN_REDIRECT_USER } from "@/routes"
import { getUserByEmail } from "@/data/user"
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/tokens"
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { getTwoFactorConformationByUserId } from "@/data/two-factor-conformation"
import { AuthError } from "next-auth"
import nodemailer from "nodemailer"
import { SigninSchema } from "@/lib"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// import { getSchemas } from "@/lib/index"
// import { getTranslations } from "next-intl/server";

// const {SigninSchema} =await (async ()=>{
//   const t = await getTranslations();
//   return getSchemas(t);
// })();




async function sendVerificationEmail(email: string, token: string, name: string) {
  const VerificationLink = `${process.env.BASE_URL}/auth/new-verification?token=${token}`;
  // console.log("Varification Link",VerificationLink);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification For CreditUnify",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your CreditUnify Account</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

        body {
            font-family: 'Roboto', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #ffffff;
            padding: 30px 20px;
            text-align: center;
            border-bottom: 3px solid #1976D2;
        }
        .logo-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        .logo {
            max-width: 100px;
            height: auto;
        }
        .logo-text {
            font-size: 32px;
            font-weight: bold;
            color: #1976D2;
            margin: auto 0;
        }
        .content {
            padding: 30px;
            background-color: #ffffff;
        }
        h1 {
            color: #1976D2;
            margin-top: 0;
            font-size: 24px;
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 12px 32px;
            background-color: #1976D2;
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
            border-top: 1px solid #eaeaea;
        }
        .divider {
            height: 1px;
            background-color: #eaeaea;
            margin: 20px 0;
        }
        .link {
            color: #1976D2;
            word-break: break-all;
            font-size: 14px;
        }
        .security-notice {
            background-color: #E3F2FD;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 14px;
            color: #0D47A1;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="https://i.imgur.com/KPeMAR9.jpeg" alt="CreditUnify logo" class="logo">
                <span class="logo-text">CreditUnify</span>
            </div>
        </div>
        <div class="content">
            <h1>Verify Your Email Address</h1>
            <p>Hello, ${name}</p>
            <p>Welcome to CreditUnify! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="${VerificationLink}" class="btn" style="color: white;">Verify Email</a>
            </p>
            <div class="security-notice">
                🔒 This link will expire in 24 hours for your security.
            </div>
            <div class="divider"></div>
            <p style="font-size: 14px;">If you're having trouble with the button, copy and paste this link into your browser:</p>
            <p class="link">${VerificationLink}</p>
            <p style="font-size: 14px; color: #666;">If you didn't create an account with CreditUnify, please ignore this email or contact our support team.</p>
        </div>
        <div class="footer">
            <p>Need help? Contact us at etracker690@gmail.com</p>
            <p>&copy; 2023 CreditUnify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
  }

  try {
    console.log('Transporter created, attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification Mail sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending Verification email:', error);
    throw error;
  }
}

const sendTwoFactorTokenEmail = async (email: string, token: string, name: string) => {

  console.log(`Attempting to send 2FA email to: ${email} , token:${token}`);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your CreditUnify Two-Factor Authentication Code",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your CreditUnify Two-Factor Authentication Code</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

        body {
            font-family: 'Roboto', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #ffffff;
            padding: 30px 20px;
            text-align: center;
            border-bottom: 3px solid #1976D2;
        }
        .logo-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        .logo {
            max-width: 100px;
            height: auto;
        }
        .logo-text {
            font-size: 32px;
            font-weight: bold;
            color: #1976D2;
            margin: auto 0;
        }
        .content {
            padding: 30px;
            background-color: #ffffff;
        }
        h1 {
            color: #1976D2;
            margin-top: 0;
            font-size: 24px;
            text-align: center;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #1976D2;
            letter-spacing: 5px;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background-color: #E3F2FD;
            border-radius: 4px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
            border-top: 1px solid #eaeaea;
        }
        .security-notice {
            background-color: #FFF8E1;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 14px;
            color: #FF6F00;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            .code {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="https://i.imgur.com/KPeMAR9.jpeg" alt="CreditUnify logo" class="logo">
                <span class="logo-text">CreditUnify</span>
            </div>
        </div>
        <div class="content">
            <h1>Your Two-Factor Authentication Code</h1>
            <p>Hello, ${name}</p>
            <p>To complete your login to CreditUnify, please use the following code:</p>
            <p class="code" id="authCode">${token}</p>
            <p>Please enter this code on the login page to verify your identity and access your account.</p>
            <div class="security-notice">
                ⏱️ This code will expire in 10 minutes for your security.
            </div>
            <p>If you didn't attempt to log in to CreditUnify, please contact our support team immediately at etracker690@gmail.com.</p>
        </div>
        <div class="footer">
            <p>Need help? Contact us at etracker690@gmail.com</p>
            <p>&copy; 2023 CreditUnify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
  }

  try {
    console.log('Transporter created, attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('2FA Mail sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending 2FA email:', error);
    throw error;
  }
}

export const Signin = async (
  values: z.infer<typeof SigninSchema>,
  callbackUrl?: string | null
) => {
  const validationeddFields = SigninSchema.safeParse(values)

  if (validationeddFields.error)
    return { error: "Invalid fields!"}

  const { email, password, code } = validationeddFields.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser || !existingUser.email || !existingUser.password)
    return { error: "Email does not exist" }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    )

    try{
      await sendVerificationEmail(verificationToken.email, verificationToken.token,existingUser.name??"");
    }catch(error){
      console.error('Test email failed:', error);
    }
    return { success: "Confirmation email sent!!" }
  }
  
  const check = await bcrypt.compare(password, existingUser.password)

  console.log("login check password",check);

  if (!check) return { error: "Invalid Password" }

  if (existingUser.isTwoFactorEnable && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)

      if (!twoFactorToken) return { error: "Invalid code!" }

      if (twoFactorToken.token !== code) return { error: "Invalid code!" }

      const hasExpired = new Date(twoFactorToken.expires) < new Date()

      if (hasExpired) return { error: "Token Has Expired!" }

      await db.tokens.delete({
        where: { id: twoFactorToken.id, type: "TwoFactor" },
      })

      const existingConformation = await getTwoFactorConformationByUserId(
        existingUser.id
      )

      if (existingConformation)
        await db.twoFactorConfirmation.delete({
          where: { id: existingConformation.id },
        })

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      })
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)

      console.log("2FA: ", twoFactorToken)


      try {
        await sendTwoFactorTokenEmail(twoFactorToken.email,twoFactorToken.token,existingUser.name??"");
        console.log('Test email sent successfully');
      } catch (error) {
        console.error('Test email failed:', error);
      }

      return { twoFactor: true }
    }
  }

  try {
    
    let redirecturl="";
    if(existingUser.role==="USER"){
      redirecturl=DEFAULT_LOGIN_REDIRECT_USER;
    }else if(existingUser.role==="ADMIN"){
      redirecturl=DEFAULT_LOGIN_REDIRECT_ADMIN;
    }else if(existingUser.role==="BANK"){
      redirecturl=DEFAULT_LOGIN_REDIRECT_BANK;
    }

    
    
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirecturl,
    })
    
    const response = NextResponse.next();
    response.cookies.set("user_role", existingUser.role);
    console.log("USER LOGED IN:",existingUser);
  } catch (e: any) {
    console.error("Error during signIn:", e)
    if (e instanceof AuthError) {
      switch (e.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" }
        default:
          return { error: "Something went wrong!" }
      }
    }
    throw e
  }
}