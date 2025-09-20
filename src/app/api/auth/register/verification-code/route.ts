import { sendWelcomeEmail } from "@/config/sendemail/email";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest)  {
    
  
  try {
    const { verificationCode, _id } = await request.json();
  if(!verificationCode) {
    return NextResponse.json({success:false,message:"verification code not found"},{status:404});
    
  } ;
 await connectToDatabase();

    /* this is efficient quering. findOne looks for one user with the given id and looks for verificationCodeExpiresAt which is greater than current time. if not found then it returns null which means !user.  */
    const user= await User.findOne({
      _id,
      verificationCodeExpiresAt:{$gt:Date.now()}
    })
    if(user?.lockVerificationCodeUntil && user.lockVerificationCodeUntil.getTime() >= Date.now()) {
      return NextResponse.json({ success: false, message: "Maximum resend attempts reached, try again later" }, { status: 403 });
    }
    if (!user) {
      return NextResponse.json({success:false,message:"user not found or code expired"},{status:404});
      
    };
    if (user.verificationCode !== verificationCode) {
      user.verificationCodeAttempts += 1;
     // Lock the account if attempts exceed the maximum limit
    if (user.verificationCodeAttempts >= 3) {
      /* Date.now() returns current date and time in milleseconds which is number. it's good to save in date format so new Date() used. getTime() used to change this date in milliseconds so it can be compared here in above*/
      user.lockVerificationCodeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Lock for 1 day
      user.verificationCodeAttempts = 0; // Reset verificationCodeAttempts after locking
    }
   await user.save();
      return NextResponse.json({success:false,message:"Inavlid or Expired Code"},{status:400});
      
    };
   user.isVerified=true;
   user.verificationCode=undefined; // Reset verificationCodeAttempts after successfully verified
   user.verificationCodeExpiresAt=undefined;
   /*Reset verificationCodeAttempts after successfully verified.locked only in continous verificationResendAttempts failure in resendVerificationCode function */
   user.verificationResendAttempts=0;
 const verifiedUser =  await user.save();
 
   await sendWelcomeEmail(verifiedUser.email,verifiedUser.name);
   
   return NextResponse.json({success:true,
    message:"Email Verified Successfully"},
    {status:200});
  } catch (error) {
    console.error('verificationCode', error);
    return NextResponse.json({ success:false, error }, { status: 500 });
  }
};