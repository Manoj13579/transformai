'use client';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



const ProfileEditAdmin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { data: session} = useSession();
  const user = session?.user;
  const [formData, setFormData] = useState({
    password: "",
    /*image variable can hold either a File object or null. At the time of declaration, it is assigned the value null, but it could later hold a File object. only null throws error coz of file value */
    image: null as File | null,
    userId: user?.id || "",
  });
const[loading, setLoading] = useState(false);

  // max file size to be uploaded set to 1 mb.
  const MAX_FILE_SIZE = 1 * 1024 * 1024; 
  

/*userId in formData is initialized with user?.id || "" at the moment the component mounts, but at that time session.data?.user from useSession() is still undefined because NextAuth loads it asynchronously.
 when the component first renders, user is undefined → so userId becomes "".Even after user is loaded, formData is not automatically updatedbecause you only set it once in useState.So even though user eventually has an id, your formData.userId stays empty.
 */
useEffect(() => {
  if (user?.id) {
    setFormData(prev => ({
      ...prev,
      userId: user.id
    }));
  }
}, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Only JPEG, JPG, and PNG are allowed.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size should be less than 1 MB");
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = user?.image;

      // If there is a new image selected, upload it
      if (formData.image) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", formData.image);
        const photoUploadResponse = await axios.post('/api/image-upload', uploadFormData);
        imageUrl = photoUploadResponse.data.data;
      }

      const updatedFormData = {
        ...formData,
        image: imageUrl,
      };

      const response = await axios.post('/api/auth/profile-edit/admin', updatedFormData, { withCredentials: true });
      if (response.data.success) {
        await signOut({ callbackUrl: "/login" });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400 || error.response.status === 403 || error.response.status === 404) {
        toast.error(error.response.data.message);
      }
      else {
        toast.error("Error in updating profile! Please try later");
        console.error("Error updating profile:", error);
      }
    }
    setLoading(false);
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="min-h-[85vh] flex items-center justify-center">
      {/* Form */}
      <div className="container max-w-md mx-auto p-5 bg-white rounded-lg space-y-4 shadow-lg">
        <div className="text-2xl font-bold text-gray-700">Edit Profile</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="block text-gray-500 font-bold">New Password</label>
            {/* div with relative positioning. relative set on input doesn't work */}
            <div className="relative">
            <Input
               // Toggle between text and password
               type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring"

            />
            {/* Toggle icon */}
            <span
              className="absolute top-2 right-2 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <Eye className="text-slate-500 h-6 w-6" />
              ) : (
                <EyeOff className="text-slate-500 h-6 w-6" />
              )}
            </span>
          </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-100">Image types allowed: jpeg, jpg, png</p>
            <p className="text-gray-100">Image size shouldn't exceed 1 MB</p>
            <label htmlFor="file-input" className="flex items-center cursor-pointer">
              <Image
                src={
                  formData.image
                    ? URL.createObjectURL(formData.image) // Preview selected image
                    : user?.image || "/images/upload_image.png" // Default or user's current image by url
                }
                alt="Profile preview"
                width={200}
                height={200}
                priority
                className="w-28 h-28 rounded-lg border border-gray-300 object-cover mt-4"
              />
              <Input
                type="file"
                onChange={handleFileChange}
                id="file-input"
                hidden
              />
            </label>
          </div>

          <div className="button-container flex justify-end mt-4">
            <Button
              type="submit"
              disabled={loading}
              className="submit-button bg-cyan-500 text-white py-2 px-4 rounded-md hover:bg-cyan-700 transition duration-300"
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ProfileEditAdmin;