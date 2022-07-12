import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";
import { pugEngine } from "nodemailer-pug-engine";

const mailer = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY,
  })
);

console.log(__dirname + '../templates/emails'); 

mailer.use('compile', pugEngine({
  templateDir: __dirname + '../templates/emails',
  pretty: true
}));

export default mailer;
