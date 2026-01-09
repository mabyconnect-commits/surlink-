import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, Users, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referralCode: searchParams.get('ref') || '',
    },
  });

  const onSubmit = async (data) => {
    if (!selectedRole) {
      toast.error('Please select an account type');
      return;
    }

    setIsLoading(true);
    try {
      const user = await registerUser({
        ...data,
        role: selectedRole,
      });
      toast.success('Account created successfully!');

      if (user.role === 'provider') {
        navigate('/provider/kyc');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-[var(--muted-foreground)]">
          Join Surlink and connect with opportunities
        </p>
      </div>

      {/* Role Selection */}
      <div className="mb-6">
        <Label className="mb-3 block">I want to...</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole('customer')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedRole === 'customer'
                ? 'border-[var(--primary)] bg-[var(--accent)]'
                : 'border-[var(--border)] hover:border-[var(--primary)]/50'
            }`}
          >
            <Users className={`mx-auto mb-2 ${selectedRole === 'customer' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} size={28} />
            <div className="font-medium">Find Services</div>
            <div className="text-xs text-[var(--muted-foreground)]">Hire professionals</div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('provider')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedRole === 'provider'
                ? 'border-[var(--primary)] bg-[var(--accent)]'
                : 'border-[var(--border)] hover:border-[var(--primary)]/50'
            }`}
          >
            <Briefcase className={`mx-auto mb-2 ${selectedRole === 'provider' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} size={28} />
            <div className="font-medium">Offer Services</div>
            <div className="text-xs text-[var(--muted-foreground)]">Earn money</div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="pl-10"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-[var(--destructive)]">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-[var(--destructive)]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <Input
              id="phone"
              type="tel"
              placeholder="+234 800 000 0000"
              className="pl-10"
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-[var(--destructive)]">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className="pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-[var(--destructive)]">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="pl-10"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-[var(--destructive)]">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="referralCode">Referral Code (Optional)</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter referral code"
              className="pl-10"
              {...register('referralCode')}
            />
          </div>
        </div>

        <div className="text-xs text-[var(--muted-foreground)]">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-[var(--primary)] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</a>.
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--primary)] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;
