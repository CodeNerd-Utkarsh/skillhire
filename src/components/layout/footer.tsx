import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto border-t">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} SkillHire. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/about" passHref><span className="text-sm hover:underline cursor-pointer">About Us</span></Link>
          <Link href="/contact" passHref><span className="text-sm hover:underline cursor-pointer">Contact</span></Link>
          <Link href="/privacy" passHref><span className="text-sm hover:underline cursor-pointer">Privacy Policy</span></Link>
          <Link href="/terms" passHref><span className="text-sm hover:underline cursor-pointer">Terms of Service</span></Link>
        </div>
      </div>
    </footer>
  );
}
