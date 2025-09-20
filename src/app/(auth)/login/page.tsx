"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonDisabled(true);

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
// Handle failure
    if (response?.error) {
      toast.error(response.error);
    } else {
      toast.success("Logged in successfully!");
// Get session to check role
      const session = await getSession();
      if (session?.user.role === "admin") {
        router.push("/admindashboard");
      } else {
        router.push("/userdashboard");
      }
    }
    setButtonDisabled(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await signIn("google", { redirect: false });
      if (!response?.error) {
        const session = await getSession();
        if (session?.user.role === "admin") {
          router.push("/admindashboard");
        } else {
          router.push("/userdashboard");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 w-full h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <Card className="shadow-lg border rounded-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center font-bold text-primary">
                TransformAI
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to continue your AI journey
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleLogin}
                className="w-full"
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  required
                  id="email"
                  type="email"
                  placeholder="text@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  required
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" type="submit" disabled={buttonDisabled}>
                Login
              </Button>
              <p className="text-sm text-center">
                <Link href="/forgot-password" className="hover:underline">
                  Forgot Password?
                </Link>
              </p>
              <p className="text-sm text-center">
                Don’t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </p>
              <p className="text-sm text-center">
                <Link href="/" className="hover:underline">
                  ← Back home
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;