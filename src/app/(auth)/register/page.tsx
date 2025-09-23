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
/*Icons is not shadcn ui to add. signup shown in shadcn ui example is copied from github page of shadcnui which also has icons.tsx used here. it is copied from github page of shadcn ui. */
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const router = useRouter();

  const handleSumit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonDisabled(true);
    if (formData.password !== confirmPassword) {
      toast.error("passwords do not match");
      return;
    }

    try {
      // axios converts formData to json automatically
      const response = await axios.post("/api/auth/register", formData);
      if (response.data.success) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "user",
        });
        setConfirmPassword("");
        router.push(`/register/register-verification/${response.data._id}`);
        toast.success(response.data.message, {
          duration: 9000,
          position: "top-center",
        });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400)
        toast.error(error.response.data.message);
      else {
        toast.error("Registration failed! Try again later");
        console.error(error);
      }
    }
    setButtonDisabled(false);
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 w-full h-screen">
      <div className="container mx-auto p-6 flex h-full">
        <div className="flex justify-center items-center w-full">
          <div className="p-6 w-2/3 hidden lg:block">
            <Image
              src="/images/ai.jpg"
              alt="Image"
              width={640} //640 px
              height={360}
              priority //in image appearing in scrolling don't use this so lazy load is automatically set. use for first appearing image
            />
          </div>
          <div className="max-w-sm rounded-xl border bg-card text-card-foreground shadow-sm">
            <Card>
              <form onSubmit={handleSumit}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center mb-4">
                    Transform AI
                  </CardTitle>
                  <CardDescription>
                    Enter your email below to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        required
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        required
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    </div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      required
                      id="email"
                      type="email"
                      placeholder="test@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      required
                      id="password"
                      type="password"
                      placeholder="at least 8 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmpassword">Confirm password</Label>
                    <Input
                      required
                      id="confirmpassword"
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button
                    className={`w-full cursor-pointer mt-2`}
                    type="submit"
                    disabled={buttonDisabled}
                  >
                    {buttonDisabled ? "Registering..." : "Register"}
                  </Button>
                  <p className="mt-3 text-sm text-center">
                    Already have an account ? <Link href="/login">Login</Link>
                  </p>
                  <p
                    className=" cursor-pointer"
                    onClick={() => router.push("/")}
                  >
                    ← back home
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
