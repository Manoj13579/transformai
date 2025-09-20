'use client';
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";




const ForgotPassword = () => {


const[email, setEmail] = useState("");
const[buttonDisabled, setButtonDisabled] = useState(false);
const router = useRouter();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonDisabled(true);
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      if(response.data.success) {
        setEmail('');
        router.push('/forgot-password/forgot-password-verification');
        toast.success(response.data.message, { duration: 6000, position: 'top-center' });
      }
    } catch (error: any) {
      if(error.response && (error.response.status === 403 || error.response.status === 404)){
      toast.error(error.response.data.message);
      }
      else {
        toast.error('cannot send verification code! try again later');
        console.error(error);
      }
    };
    setButtonDisabled(false);
  };
  return (
    <section className="h-screen flex items-center justify-center flex-col bg-gradient-to-br from-white to-gray-50">
        <p className="text-gray-500 text-2xl font-bold ">Reset Password</p>
     <form className="flex flex-col flex-wrap justify-center items-center gap-y-2 bg-gray-50 p-8" onSubmit={handleSubmit}>
        <label htmlFor="email">
          <div className="flex items-center">
            <Input
              id="email"
              className="placeholder:italic placeholder:text-gray-700 block bg-white h-10  w-60 md:w-96 border-2 border-slate-400 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-cyan-500 focus:ring-cyan-500 focus:ring-1 text-sm md:text-base text-gray-800"
              placeholder="Enter Email"
              required
              type="email"
              name="email"
              value={email}
              onChange = {(e) => setEmail(e.target.value)}
            />
          </div>
        </label>
        <Button className= 'text-black font-semibold bg-gray-300 hover:bg-gray-200 cursor-pointer rounded-md p-1 disabled:bg-gray-400 disabled:cursor-not-allowed' type='submit' disabled={buttonDisabled}>Submit</Button>
        </form>
    </section>
  )
}

export default ForgotPassword;