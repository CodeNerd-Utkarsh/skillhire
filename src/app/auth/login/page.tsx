"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { loginUser } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import { UserPayload } from '@/lib/auth';

interface LoginPageProps {
    user: UserPayload | null;
}

export default function LoginPage({ user }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);

    const result = await loginUser(formData);

    setIsLoading(false);

    if (result.error) {
      console.error("Login error:", result.error, result.details);
      toast({
        title: "Login Failed",
        description: result.error || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } else if (result.success) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });


      if (result.role === 'freelancer') {
        router.push('/freelancer/dashboard');
      } else {
        router.push('/client/dashboard');
      }
       router.refresh();
    }
  };



  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-secondary/30">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Welcome Back!</CardTitle>
            <CardDescription>Sign in to continue to SkillHire</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="text-right">

                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            <p>
              Don't have an account?{' '}
              <Link href="/auth/signup" passHref>
                <span className="text-primary hover:underline font-medium cursor-pointer">Sign Up</span>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}


