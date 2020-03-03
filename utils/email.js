const nodemailer = require ('nodemailer');

const sendEmail =  async options => {
    // 1) create transporter(service)
    const transporter = nodemailer.createTransport({
        
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // active in gmail "less secure app"
    });

    // 2) define the email
    const mailOptions = {
        from: 'dani <daniAdmin@test.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
      
    };

    // 3) send the email
    await transporter.sendMail(mailOptions)
};

module.exports = sendEmail;