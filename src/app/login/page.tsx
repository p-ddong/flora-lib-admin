'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setToken } from '@/store/authSlice';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface LoginFormInputs {
  username: string;
  password: string;
}

type JwtPayload = {
  sub: string;
  username: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const router = useRouter();
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState('');

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoginError('');
      const token = await login(data.username, data.password);

      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.role === 'user') {
        setLoginError('Access denied. User role is not allowed.');
        return;
      }

      localStorage.setItem('token', token);
      dispatch(setToken(token));
      router.replace('/dashboard');
    } catch (err) {
      console.error('Login failed', err);
      setLoginError((err as Error).message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen w-dvw">
      {/* Left side - Login Form */}
      <div className="flex flex-col justify-center w-full px-4 sm:px-6 md:w-1/2 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your Username to sign in to your account
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="username">
                    Username
                  </label>
                  <Input
                    id="username"
                    placeholder="yourname"
                    type="text"
                    {...register('username', { required: 'Username is required' })}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password.message}</p>
                  )}
                </div>

                {loginError && (
                  <p className="text-red-600 text-sm text-center">{loginError}</p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image or Branding */}
      <div className="hidden md:block md:w-1/2 bg-muted"></div>
    </div>
  );
}
