import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Vote } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 hover:opacity-90 transition cursor-pointer">
            <Vote className="h-5 w-5" />
            <h1 className="text-xl md:text-2xl font-medium">CongressTrack</h1>
          </div>
        </Link>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" className="bg-white text-primary hover:bg-gray-100">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
}
