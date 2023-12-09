const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const config = {
  host: "smtp.office365.com",

  port: 587,

  secure: false,

  auth: {
    user: process.env.OUTLOOK_EMAIL,

    pass: process.env.OUTLOOK_PASSWORD,
  },
};

const sendInvitationEmail = (email, verificationToken) => {
  const verificationUrl = `${process.env.API_BASE_URL}/api/users/verify/${verificationToken}`;
  const transporter = nodemailer.createTransport(config);
  const emailOptions = {
    from: process.env.OUTLOOK_EMAIL,
    to: email,
    subject: "Please verify your account",
    text: verificationUrl,
  };

  transporter
    .sendMail(emailOptions)
    .then((info) => console.log(info))
    .catch((err) => console.log(err));
};

module.exports = {
  sendInvitationEmail,
};
