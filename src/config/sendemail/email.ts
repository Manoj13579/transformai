import { transporter } from "./emailConfig";
import { Verification_Email_Template, Welcome_Email_Template } from "./emailTemplate";

/* this approach for 2-step authentication in used gmail account without it approach should be modified. this approach more secure */
export const sendVerificationEmail=async(email:string, verificationCode:string)=>{
  
    try {
     const response=   await transporter.sendMail({
            from: '"Transform AI" <app.basant@gmail.com>',
            to: email, // list of receivers
            subject: "Verify your Email", // Subject line
            text: "Verify your Email", // plain text body
            html: Verification_Email_Template.replace("{verificationCode}",verificationCode)
        })
        console.log('Email send Successfully',response)
    } catch (error) {
        console.log('Email error sendverification',error)
    }
};
export const sendWelcomeEmail=async(email:string, name: string)=>{
    try {
     const response=   await transporter.sendMail({
            from: '"Transform AI" <app.basant@gmail.com>',
            to: email, // list of receivers
            subject: "Welcome Email", // Subject line
            text: "Welcome Email", // plain text body
            html: Welcome_Email_Template.replace("{name}",name)
        })
        console.log('Email send Successfully',response)
    } catch (error) {
        console.log('Email error',error)
    }
}