'use client';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';





const ForgotPasswordVerification = () => {

    const [formData, setFormData] = useState({
      verificationCode: "",
      email: "",
      password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef(null);
    const router = useRouter();
   
    
    

  


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
          const response = await axios.post('/api/auth/forgot-password/forgot-password-verification', formData );
          if(response.data.success) {
            toast.success(response.data.message, { duration: 6000, position: 'top-center' });
            router.push('/login');
          }
        } catch (error: any) {
          if(error.response && (error.response.status === 403 || error.response.status === 404 || error.response.status === 400)) {
            toast.error(error.response.data.message);
          }
          else {
            console.error(error);
            toast.error('cannot reset password! try again later')
          }
        }
      };

    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };

  return (
    <section className="h-screen flex items-center justify-center flex-col bg-gradient-to-br from-white to-gray-50">
        <p className="text-gray-500 text-2xl font-bold ">Reset Password</p>
     <form className="flex flex-col flex-wrap justify-center items-center gap-y-2 bg-gray-50 p-8" onSubmit={handleSubmit}>
     <label htmlFor="verification-code">
          <div className="flex items-center">
            <input
              id="verification-code"
              className="placeholder:italic placeholder:text-gray-700 block bg-white h-10  w-60 md:w-96 border-2 border-slate-400 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-cyan-500 focus:ring-cyan-500 focus:ring-1 text-sm md:text-base text-gray-800"
              placeholder="Enter Code"
              required
             ref= {inputRef}
              autoFocus
              type="text"
              name="verification-code"
              value={formData.verificationCode}
              onChange={(e) => setFormData({...formData, verificationCode: e.target.value})}
            />
          </div>
        </label>
        <label htmlFor="email">
          <div className="flex items-center">
            <input
              id="email"
              className="placeholder:italic placeholder:text-gray-700 block bg-white h-10  w-60 md:w-96 border-2 border-slate-400 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-cyan-500 focus:ring-cyan-500 focus:ring-1 text-sm md:text-base text-gray-800"
              placeholder="Enter Email"
              required
              type="email"
              name="email"
              value={formData.email}
              onChange = {(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </label>
     <label htmlFor="password" className="relative block">
          <div className="flex items-center">
            <input
              id="password"
              className="placeholder:italic placeholder:text-gray-700 block bg-white h-10 w-60 md:w-96 border-2 border-slate-400 rounded-md py-2 pl-9 pr-10 shadow-sm focus:outline-none focus:border-cyan-500 focus:ring-cyan-500 focus:ring-1 text-sm md:text-base text-gray-800"
              placeholder="At least 8 characters"
              required
              // Toggle between text and password
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            {/* Toggle icon */}
            <span
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="text-slate-500 h-6 w-6" />
              ) : (
                <Eye className="text-slate-500 h-6 w-6" />
              )}
            </span>
          </div>
        </label>
        <Button className= 'text-black cursor-pointer font-semibold bg-gray-300 hover:bg-gray-200 rounded-md p-1 disabled:bg-gray-400 disabled:cursor-not-allowed' type='submit'>Submit</Button>
        </form>
    </section>
  )
}

export default ForgotPasswordVerification;