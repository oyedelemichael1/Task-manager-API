const sgMail = require('@sendgrid/mail')





sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//      to: 'oyedelemichael1@gmail.com',
//      from: 'oyedelemichael1@gmail.com',
//      subject:' This is my first email',
//      text : 'i hope this gets to you'
// })

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to: email,
        from:'oyedelemichael1@gmail.com',
        subject : 'Thanks for joining us',
        text: `welcome to the app, ${name}. Let me know how thing go with the app with the app`
    })

}

const sendCancellationEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'oyedelemichael1@gmail.com',
        subject: 'Goodbye',
        text: `Goodbye ${name}. Is there anything we could have done to keep you with us?`
    })
}
module.exports ={
    //sendWelcomeEmail :sendWelcomeEmail
    sendWelcomeEmail,
    sendCancellationEmail
}
