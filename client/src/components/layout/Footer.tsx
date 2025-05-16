export default function Footer() {
  return (
    <footer className="bg-neutral-500 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="md:flex md:justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="material-icons mr-2">how_to_vote</span>
              <h2 className="text-lg font-bold">CongressTrack</h2>
            </div>
            <p className="text-sm mt-2">Track how your representatives vote on issues that matter to you.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">Resources</h3>
              <ul className="space-y-1">
                <li><a href="https://www.propublica.org/datastore/api/propublica-congress-api" className="hover:text-white/80" target="_blank" rel="noopener noreferrer">API Documentation</a></li>
                <li><a href="#" className="hover:text-white/80">Data Sources</a></li>
                <li><a href="#" className="hover:text-white/80">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Connect</h3>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-white/80">Contact Us</a></li>
                <li><a href="#" className="hover:text-white/80">Twitter</a></li>
                <li><a href="#" className="hover:text-white/80">GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">About</h3>
              <ul className="space-y-1">
                <li><div className="hover:text-white/80 cursor-pointer" onClick={() => window.location.href = '/about'}>Our Mission</div></li>
                <li><a href="#" className="hover:text-white/80">Team</a></li>
                <li><a href="#" className="hover:text-white/80">Sponsors</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/20 text-sm text-center md:text-left text-white/60">
          &copy; {new Date().getFullYear()} CongressTrack. All rights reserved. Data sourced from public congressional records.
        </div>
      </div>
    </footer>
  );
}
