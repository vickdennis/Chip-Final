import nodemailer from 'nodemailer';

async function sendTest() {
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = port === 465;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"CHIP NG Admin" <${process.env.SMTP_USER}>`,
      to: 'vickthor.dennis@gmail.com',
      subject: 'Test Email from AI Studio',
      text: 'Hello! If you are seeing this, your Gmail SMTP configuration is working perfectly!',
    });

    console.log("Success! Email sent with ID: " + info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err.message);
  }
}

sendTest();
