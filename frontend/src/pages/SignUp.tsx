import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Github, Linkedin, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";
import axios from '../api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'Working professional';
  company: string;
  location: string;
}

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    company: '',
    location: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');

    if (token && userId) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      toast.success("Welcome aboard!", {
        description: "Your social account has been linked successfully.",
      });
      navigate('/profile');
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password Mismatch", {
        description: "The confirmation password does not match.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase(),
        company: formData.role === 'Working professional' ? formData.company : null,
        location: formData.location, // In the new design, location is available for both
      });

      console.log('Registration successful:', response.data);
      const { token, userId } = response.data;

      if (token && userId) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        toast.success("Account Created!", {
          description: "Registration successful. Redirecting to your profile...",
        });
        navigate('/profile');
      } else {
        toast.success("Account Created!", {
          description: "Registration successful. Please log in.",
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error("API Registration failed.", error);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error("Registration Error", {
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider: 'google' | 'github' | 'linkedin') => {
    setIsLoading(true);
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    window.location.href = `${backendUrl}/api/auth/social/${provider}`;
  };


  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#f8fafc] dark:bg-[#030014] flex flex-col items-center justify-center">
      <div className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-[28px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-800">
        <div className="relative mb-8 pt-2">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Create an account</h1>
            <p className="text-[15px] text-slate-500 dark:text-slate-400">Enter your details to get started with Xshare</p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 p-1.5 rounded-2xl flex gap-1 mb-8">
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, role: 'student' }))}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-[14px] transition-all duration-200 ${formData.role === 'student'
              ? 'bg-white dark:bg-slate-700 shadow-sm border border-slate-200/60 dark:border-slate-600'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transparent border border-transparent'
              }`}
          >
            <span className={`text-[15px] font-bold ${formData.role === 'student' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Student</span>
            <span className={`text-[11px] font-medium mt-0.5 ${formData.role === 'student' ? 'text-slate-500 dark:text-slate-300' : 'text-slate-400 max-w-[120px] text-center'}`}>Looking for guidance</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, role: 'Working professional' }))}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-[14px] transition-all duration-200 ${formData.role === 'Working professional'
              ? 'bg-white dark:bg-slate-700 shadow-sm border border-slate-200/60 dark:border-slate-600'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transparent border border-transparent'
              }`}
          >
            <span className={`text-[15px] font-bold ${formData.role === 'Working professional' ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-300'}`}>Working Professional</span>
            <span className={`text-[11px] font-medium mt-0.5 ${formData.role === 'Working professional' ? 'text-slate-500 dark:text-slate-300' : 'text-slate-400'}`}>Ready to mentor</span>
          </button>
        </div>

        {/* Social Connect */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => handleSocialSignUp('google')} className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleSocialSignUp('github')} className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800">
            <Github className="w-5 h-5 text-slate-900 dark:text-white" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleSocialSignUp('linkedin')} className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800">
            <Linkedin className="w-5 h-5 text-[#0077b5]" />
          </Button>
        </div>

        <div className="relative flex items-center mb-8">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="mx-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">OR REGISTER WITH EMAIL</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[15px] font-medium text-slate-900 dark:text-slate-200">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-12 rounded-[12px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-base px-4 focus-visible:ring-1 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[15px] font-medium text-slate-900 dark:text-slate-200">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-12 rounded-[12px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-base px-4 focus-visible:ring-1 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-[15px] font-medium text-slate-900 dark:text-slate-200">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Your city"
              value={formData.location}
              onChange={handleChange}
              required
              className="h-12 rounded-[12px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-base px-4 focus-visible:ring-1 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {formData.role === 'Working professional' && (
            <div className="space-y-2">
              <Label htmlFor="company" className="text-[15px] font-medium text-slate-900 dark:text-slate-200">Company</Label>
              <Input
                id="company"
                name="company"
                placeholder="Current organization"
                value={formData.company}
                onChange={handleChange}
                required
                className="h-12 rounded-[12px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-base px-4 focus-visible:ring-1 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[15px] font-medium text-slate-900 dark:text-slate-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-[12px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-base pl-4 pr-10 focus-visible:ring-1 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[15px] font-medium text-slate-900 dark:text-slate-200">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-[12px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-base pl-4 pr-10 focus-visible:ring-1 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-4 rounded-[12px] bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[15px] shadow-sm transition-all"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="mt-8 text-center text-[15px] font-medium text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
