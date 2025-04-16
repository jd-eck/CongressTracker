import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <span className="material-icons text-2xl">how_to_vote</span>
            <h1 className="text-xl font-bold">CongressTrack</h1>
          </a>
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/">
            <a className={location === "/" ? "text-white font-semibold" : "hover:text-white/80"}>
              Dashboard
            </a>
          </Link>
          <Link href="/preferences">
            <a className={location === "/preferences" ? "text-white font-semibold" : "hover:text-white/80"}>
              My Preferences
            </a>
          </Link>
          <Link href="/about">
            <a className={location === "/about" ? "text-white font-semibold" : "hover:text-white/80"}>
              About
            </a>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="hidden md:inline">Demo User</span>
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="material-icons text-sm">person</span>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden flex justify-around border-t border-primary-foreground/20">
        <Link href="/">
          <a className={`py-2 flex flex-col items-center ${location === "/" ? "text-white" : "text-white/60"}`}>
            <span className="material-icons text-sm">dashboard</span>
            <span className="text-xs">Dashboard</span>
          </a>
        </Link>
        <Link href="/preferences">
          <a className={`py-2 flex flex-col items-center ${location === "/preferences" ? "text-white" : "text-white/60"}`}>
            <span className="material-icons text-sm">settings</span>
            <span className="text-xs">Preferences</span>
          </a>
        </Link>
        <Link href="/about">
          <a className={`py-2 flex flex-col items-center ${location === "/about" ? "text-white" : "text-white/60"}`}>
            <span className="material-icons text-sm">info</span>
            <span className="text-xs">About</span>
          </a>
        </Link>
      </div>
    </header>
  );
}
