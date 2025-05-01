import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, LogIn, UserPlus } from 'lucide-react';

export function Header() {
  // TODO: Add conditional rendering based on user login state
  const isLoggedIn = false; // Replace with actual auth check
  const userRole = 'client'; // Replace with actual user role

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" passHref>
          <div className="flex items-center gap-2 cursor-pointer">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">SkillHire</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/services" passHref>
            <Button variant="ghost">Browse Services</Button>
          </Link>

          {isLoggedIn ? (
             <>
                <Link href={userRole === 'freelancer' ? "/freelancer/dashboard" : "/client/dashboard"} passHref>
                    <Button variant="outline">Dashboard</Button>
                </Link>
                {/* Add Logout Button/Dropdown here */}
                 <Button variant="ghost" onClick={() => { /* Implement logout */ }}>Logout</Button>
             </>
          ) : (
            <>
              <Link href="/auth/login" passHref>
                <Button variant="outline">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
              <Link href="/auth/signup" passHref>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </Button>
              </Link>
             </>
          )}
        </div>
      </nav>
    </header>
  );
}
