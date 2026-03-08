import nodemailer from "nodemailer";

export const sendEscalationEmail = async (email, sla) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "SLA Breach Alert",
    text: `
SLA Breach Alert!

Module: ${sla.module}
Related ID: ${sla.relatedTo}
Breach Time: ${sla.breachTime}

Immediate attention required.
    `,
  });
};