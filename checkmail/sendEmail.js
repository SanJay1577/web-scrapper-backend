import nodemailer from 'nodemailer';
export const sendEmail = async(email,subject,text)=>{
 try {
     //creating a transporter 
     const transporter = nodemailer.createTransport({
         host:process.env.HOST,
         service:process.env.SERVICE,
         port:Number(process.env.EMAIL_PORT),
         secure:Boolean(process.env.SECURE),
         auth:{
             user:process.env.USER,
             pass:process.env.PASS,
         }
     });
     //mail formating 
     await transporter.sendMail({
         from:process.env.USER,
         to:email,
         subject:subject,
         text:text,
     });
     console.log("email sent sucessfully")
 } catch (error) {
     console.log("email is not sent check the email address");
     console.log(error);
     return error;
 }
}; 
