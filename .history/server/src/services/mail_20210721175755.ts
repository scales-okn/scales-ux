import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";

const mailTransport = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY,
  })
);

export default mailTransport;
