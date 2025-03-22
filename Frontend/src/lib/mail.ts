import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
  const domain = process.env.NEXT_PUBLIC_APP_URL;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verification",
    html: `token: <a href="${domain}/auth/new-verification?token=${token}">Click here </a> to verify`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      throw error;
    }
  });
}


export const sendPasswordResetEmail = async(email:string,token:string) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL;
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verification",
    html: `token: <a href=${resetLink}>Click here </a> to Change password`,
  };


  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      throw error;
    }
  });
}

export const sendTwoFactorTokenEmail = async(email:string,token:string) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject:"2FA Code",
    html:`<p> 2FA Code ${token}</>`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      throw error;
    }
  });
}