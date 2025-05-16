import { Vote } from "lucide-react";
import { Link } from "wouter";

export default function AppFooter() {
  return (
    <footer className="bg-neutral-400 text-white mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/">
              <div className="flex items-center space-x-2 hover:opacity-90 transition cursor-pointer">
                <Vote className="h-5 w-5" />
                <span className="text-lg font-medium">CongressTrack</span>
              </div>
            </Link>
            <p className="text-sm mt-1 text-gray-300">
              Track how your representatives vote on issues that matter to you.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition">About</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Contact</a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} CongressTrack. All rights reserved. Data sourced from public government APIs.</p>
        </div>
      </div>
    </footer>
  );
}
