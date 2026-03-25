const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {

    const info = await transporter.sendMail({
      from: `"DevConnect" <${process.env.SENDER_MAIL}>`,
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT:", info.messageId);

  } catch (error) {

    console.error("EMAIL ERROR:", error);

  }
};

module.exports = sendEmail;