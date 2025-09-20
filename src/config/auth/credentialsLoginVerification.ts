import { connectToDatabase } from "@/lib/db";
import { logEvent } from "@/lib/logEvent";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function credentialsLoginVerification(email: string, password: string, req?: any) {
  await connectToDatabase();
  const user = await User.findOne({ email});

  if (!user) {
    throw new Error("Wrong email or password");
  }

  if (!user.isVerified) {
    throw new Error("Email not verified");
  }

  if (user.lockLoginUntil && user.lockLoginUntil.getTime() >= Date.now()) {
    throw new Error("Account locked! Try again later");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password ?? "");

  if (!isPasswordCorrect) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= 3) {
      user.lockLoginUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Lock for 1 day
      user.loginAttempts = 0; // reset counter
    }

    await user.save();
    throw new Error("Wrong email or password");
  }

  user.loginAttempts = 0; // reset on success
  await user.save();

  //  logEvent for credentials login success
  await logEvent({
    userId: (user._id as string).toString(),
    userEmail: user.email,
    eventType: "Credentials Login Success",
    level: "Info",
    details: "User logged in successfully with email/password",
    req,
  });
  
// If successful, returns a user object. user used in async jwt, async session in  callbacks. can pass role from here to callbacks but throws typescript error which is not till date fixed by NextAuth team.
  return {
    id: (user._id as string).toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    role: ""// will overwrite from jwt callback
  };
}
