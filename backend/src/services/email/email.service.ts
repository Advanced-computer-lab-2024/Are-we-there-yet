import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { NotificationType } from '../../types/Notification.types';

class EmailService {
  email = process.env.EMAIL;
  password = process.env.PASSWORD;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: this.email,
      pass: this.password,
    },
  });

  sendNotificationEmail(email: string, notification: NotificationType) {
    try {
      // Read the HTML file
      const filePath = path.join(__dirname, '../email-templates/notification.html');
      let htmlContent = fs.readFileSync(filePath, 'utf-8');

      // Replace the placeholders with the actual notification data
      htmlContent = htmlContent.replace('{{title}}', notification.title ?? 'Notification');
      htmlContent = htmlContent.replace('{{message}}', notification.message ?? '');

      const mailOptions = {
        from: this.email,
        to: email,
        subject: notification.title ?? 'Notification',
        html: htmlContent,
      };

      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error sending notification email:', error);
    }
  }

  async sendForgotPasswordEmail(email: string, OTP: string) {
    try {
      // Read the HTML file
      const filePath = path.join(__dirname, './email-templates/forgotPassword.html');
      let htmlContent = fs.readFileSync(filePath, 'utf-8');

      // Replace the placeholder with the actual OTP
      htmlContent = htmlContent.replace('{{otp}}', OTP);

      const mailOptions = {
        from: this.email,
        to: email,
        subject: 'Reset Password',
        html: htmlContent,
      };

      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error sending forgot password email:', error);
    }
  }

  async sendFlaggedEmail(email: string) {
    try {
      const filePath = path.join(__dirname, './email-templates/flagged.html');
      let htmlContent = fs.readFileSync(filePath, 'utf-8');
      const mailOptions = {
        from: this.email,
        to: email,
        subject: 'Flagged Content',
        html: htmlContent,
      };
      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error sending flagged email:', error);
    }
  }

  async sendReceiptEmail(email: string, receipt: any) {
    try {
      const filePath = path.join(__dirname, './email-templates/paymentReceipt.html');
      let htmlContent = fs.readFileSync(filePath, 'utf-8');

      htmlContent = htmlContent.replace('{{total}}', receipt.totalPrice);

      const mailOptions = {
        from: this.email,
        to: email,
        subject: 'Receipt',
        html: htmlContent,
      };

      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error sending receipt email:', error);
    }
  }

  async sendBirthdayEmail(email: string, name: string, promoCode: string) {
    try {
      // Read the HTML file
      const filePath = path.join(__dirname, './email-templates/birthdayPromoCode.html');
      let htmlContent = fs.readFileSync(filePath, 'utf-8');

      // Replace the placeholders with the actual data
      htmlContent = htmlContent.replace('{{name}}', name);
      htmlContent = htmlContent.replace('{{promoCode}}', promoCode);

      const mailOptions = {
        from: this.email,
        to: email,
        subject: 'Happy Birthday! from Are We There Yet',
        html: htmlContent,
      };

      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error sending forgot password email:', error);
    }
  }

  async outOfStockEmail(email: string) {
    try {
      const filePath = path.join(__dirname, './email-templates/outOfStock.html');
      let htmlContent = fs.readFileSync(filePath, 'utf-8');
      const mailOptions = {
        from: this.email,
        to: email,
        subject: 'Out of Stock',
        html: htmlContent,
      };
      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error sending out of stock email:', error);
    }
  }

  async bookingOpenEmail(email: string) {
    try {
      const filePath = path.join(__dirname, './email-templates/bookingOpen.html');
      let htmlContent = fs.readFileSync(filePath, 'utf-8');
      const mailOptions = {
        from: this.email,
        to: email,
        subject: 'Booking Open',
        html: htmlContent,
      };
      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error sending booking open email:', error);
    }
  }

  async ticketsUpdateEmail(email: string, tickets: number) {
    try {
      const filePath = path.join(__dirname, './email-templates/ticketsUpdate.html');
      let htmlContent = fs.readFileSync(filePath, 'utf-8');
      htmlContent = htmlContent.replace('{{tickets}}', tickets.toString());
      const mailOptions = {
        from: this.email,
        to: email,
        subject: 'Tickets Update',
        html: htmlContent,
      };
      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error sending tickets update email:', error);
    }
  }
}

export default new EmailService();
