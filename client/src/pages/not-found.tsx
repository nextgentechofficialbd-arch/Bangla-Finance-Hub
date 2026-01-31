import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
      <div className="h-20 w-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 animate-pulse">
        <AlertTriangle size={40} />
      </div>
      <h1 className="text-3xl font-bold mb-2">404 Page Not Found</h1>
      <p className="text-muted-foreground mb-8">The page you are looking for does not exist.</p>
      
      <Link href="/" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
        Back to Dashboard
      </Link>
    </div>
  );
}
