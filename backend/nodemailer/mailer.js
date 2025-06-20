import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "alakjarasatyam@gmail.com",
        pass: "pziq mxia ewot mzvp" ,
    },
    port: 465,
    secure: true,
});


export const sendMail = async (to, subject, text, html) => {
    try {
        if (!to || !subject || (!text && !html)) {
            throw new Error('Missing required email fields.');
        }
  
        const mailOptions = {
            from: "alakjarasatyam@gmail.com",
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        transporter.verify((error, success) => {
            if (error) {
                console.error('Transporter verification failed:', error);
            } else {
                console.log('Transporter verified successfully:', success);
            }
        });
        
        console.log('Email sent successfully!');
        // console.log('Message ID:', info.messageId);
        // console.log('Accepted:', info.accepted);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
