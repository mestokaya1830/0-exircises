import express from 'express'
const app = express()
import nodeMailer  from 'nodemailer'

app.use(express.json())
app.use(express.urlencoded({extended: true}))

//email host settings
const transporter = nodeMailer.createTransport({
  host: "smtp-mail.outlook.com",
  auth: {
    user:'mesto1830@outlook.com',
    pass: 'MK1972mk11130113'
  }
})

//email options
const mailoption  = {
  from: 'mesto1830@outlook.com',
  to: 'mesto1830@gmail.com',
  //to: ['email1','email2','email3'],//for multiple receiver
  subject: 'Test',
  text: 'Hello Mesto',
  html: `
  <h3>How are you?To confirm your E-Mail please click on this link</h3>
  <a href="http://localhost:3000/reset-password">Activate</a>
  `
}

//send email
transporter.sendMail(mailoption,(err, info) =>{
  if (err) {
    console.log(err)
  }
  console.log('Email send:' + info.response)
})

app.get('/reset-password', (req, res) => {
  res.status(200).json('Password updated!')
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started...')
})
