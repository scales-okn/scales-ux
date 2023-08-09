const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const templatePaths = {
  confirmAccount: path.join(__dirname, "./confirmAccount.html"),
  resetPassword: path.join(__dirname, "./resetPassword.html"),
};

const SES_CONFIG = {
  accessKeyId: process.env.SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  region: process.env.SES_REGION,
};

const AWS_SES = new AWS.SES(SES_CONFIG);

type sendMailT = {
  recipientEmail: string;
  templateName: "confirmAccount" | "resetPassword";
  recipientName: string;
  emailSubject: string;
  templateArgs: {
    url?: string;
    resetPasswordUrl?: string;
    saturnUrl?: string;
    sesSender?: string;
  };
};

export const sendEmail = ({
  recipientEmail,
  templateName,
  templateArgs,
  recipientName,
  emailSubject,
}: sendMailT) => {
  const filename = templatePaths[templateName];
  const htmlSource = fs.readFileSync(filename, {
    encoding: "utf-8",
  });
  const template = handlebars.compile(htmlSource);
  const html: string = template({ ...templateArgs, recipientName });

  const params = {
    Source: process.env.SES_SENDER,
    Destination: {
      ToAddresses: [recipientEmail],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: emailSubject,
      },
    },
  };
  return AWS_SES.sendEmail(params).promise();
};