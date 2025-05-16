import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <span className="material-icons text-2xl">how_to_vote</span>
          <h1 className="text-xl font-bold">CongressTrack</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          <div 
            className={`cursor-pointer ${location === "/" ? "text-white font-semibold" : "hover:text-white/80"}`}
            onClick={() => window.location.href = '/'}
          >
            Dashboard
          </div>
          <div 
            className={`cursor-pointer ${location === "/preferences" ? "text-white font-semibold" : "hover:text-white/80"}`}
            onClick={() => window.location.href = '/preferences'}
          >
            My Preferences
          </div>
          <div 
            className={`cursor-pointer ${location === "/about" ? "text-white font-semibold" : "hover:text-white/80"}`}
            onClick={() => window.location.href = '/about'}
          >
            About
          </div>
        </nav>
        
        <div className="flex items-center space-x-2">
          <span className="hidden md:inline">Demo User</span>
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="material-icons text-sm">person</span>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden flex justify-around border-t border-primary-foreground/20">
        <div 
          className={`py-2 flex flex-col items-center cursor-pointer ${location === "/" ? "text-white" : "text-white/60"}`}
          onClick={() => window.location.href = '/'}
        >
          <span className="material-icons text-sm">dashboard</span>
          <span className="text-xs">Dashboard</span>
        </div>
        <div 
          className={`py-2 flex flex-col items-center cursor-pointer ${location === "/preferences" ? "text-white" : "text-white/60"}`}
          onClick={() => window.location.href = '/preferences'}
        >
          <span className="material-icons text-sm">settings</span>
          <span className="text-xs">Preferences</span>
        </div>
        <div 
          className={`py-2 flex flex-col items-center cursor-pointer ${location === "/about" ? "text-white" : "text-white/60"}`}
          onClick={() => window.location.href = '/about'}
        >
          <span className="material-icons text-sm">info</span>
          <span className="text-xs">About</span>
        </div>
      </div>
    </header>
  );
}
