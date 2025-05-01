"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'freelancer' ? 'freelancer' : 'client';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'freelancer' || roleParam === 'client') {
        setRole(roleParam);
    }
  }, [searchParams]);


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);


    console.log("Attempting signup with:", { name, email, password, role });

    try {


      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Signup Successful",
        description: "Welcome to SkillHire! Please check your email to verify your account.",
      });



    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
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
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Create Your Account</CardTitle>
            <CardDescription>Join SkillHire as a client or freelancer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
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
                      placeholder="•••••••• (min. 8 characters)"
                      required
                      minLength={8}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                 <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                       className="pr-10"
                    />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground focus:outline-none"
                     aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                     disabled={isLoading}
                   >
                     {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                   </button>
                 </div>
              </div>
               <div className="space-y-2">
                 <Label>I want to:</Label>
                 <RadioGroup
                   value={role}
                   onValueChange={(value) => setRole(value as 'client' | 'freelancer')}
                   className="flex space-x-4"
                   disabled={isLoading}
                 >
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="client" id="role-client" />
                     <Label htmlFor="role-client">Hire for a project</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="freelancer" id="role-freelancer" />
                     <Label htmlFor="role-freelancer">Work as a freelancer</Label>
                   </div>
                 </RadioGroup>
               </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                 {isLoading ? (
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                 ) : (
                   <UserPlus className="mr-2 h-4 w-4" />
                 )}
                 {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" passHref>
                <span className="text-primary hover:underline font-medium cursor-pointer">Sign In</span>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
