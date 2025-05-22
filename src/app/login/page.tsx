"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { jwtDecode } from 'jwt-decode';
import { setToken, setUser } from "@/store/authSlice";
import { User } from "@/types";

interface LoginFormInputs {
  username: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const router = useRouter();
  const dispatch = useDispatch();

const onSubmit = async (data: LoginFormInputs) => {
  try {
    const token = await login(data.username, data.password);
    localStorage.setItem("token", token);
    dispatch(setToken(token));

    const decodedUser = jwtDecode<User>(token);
    dispatch(setUser(decodedUser));

    router.replace('/dashboard');
  } catch (err) {
    console.error("Login failed", err);
    alert("Invalid email or password.");
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
                  <label
                    className="text-sm font-medium leading-none"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    placeholder="name@example.com"
                    type="text"
                    {...register("username", { required: "Email is required" })}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="password"
                    >
                      Password
                    </label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Brand/Image */}
      <div className="hidden md:block md:w-1/2 bg-muted">
                  
      </div>
    </div>
  );
}
