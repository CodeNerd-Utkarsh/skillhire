'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { logoutUser } from '@/app/auth/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
        const result = await logoutUser();
        if (result?.error) {
            toast({
                title: "Logout Failed",
                description: result.error,
                variant: "destructive",
            });
        } else {
             toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
            router.refresh();
        }
    };

    return (
        <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
    );
}
