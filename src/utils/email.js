
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendAlertEmail = async (data) => {
    const msg = {
        to: data.email, // Change to your recipient
        from: 'beyondtraining.lk@gmail.com', // Change to your verified sender
        subject: data.subject,
        html: `<strong>${data.message}</strong>`,
    }
    
    try{
        await sgMail.send(msg);
        return {success: "Email send"}
    }catch(e){
        return {error: e.message}
    }
}

module.exports = sendAlertEmail;


