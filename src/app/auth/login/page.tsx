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
// import { signIn } from 'next-auth/react'; // Import appropriate auth library function if used

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- Authentication Logic ---
    // Replace this with your actual authentication call (e.g., using fetch, axios, or an auth library like NextAuth.js)
    console.log("Attempting login with:", { email, password });

    try {
      // Example using fetch:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || 'Login failed');
      // }

      // // --- Using NextAuth.js ---
      // const result = await signIn('credentials', { // Use your credential provider name
      //   redirect: false, // Don't redirect automatically, handle manually
      //   email,
      //   password,
      // });

      // if (result?.error) {
      //   throw new Error(result.error);
      // }

      // --- Mock Success ---
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
       if (email === "test@example.com" && password === "password") {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          // Redirect to dashboard or homepage after successful login
          // window.location.href = '/dashboard'; // Or use Next.js router: router.push('/dashboard');
       } else {
           throw new Error("Invalid email or password.");
       }
      // --- End Mock Success ---


    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-secondary/30">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Welcome Back!</CardTitle>
            <CardDescription>Sign in to continue to SkillHire</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <Link href="/auth/forgot-password" passHref>
                    <span className="text-sm text-primary hover:underline cursor-pointer">Forgot password?</span>
                  </Link>
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
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