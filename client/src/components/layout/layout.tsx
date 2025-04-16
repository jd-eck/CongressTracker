import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [congressId, setCongressId] = useState<string>("117");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuButtonClick={() => setSidebarOpen(!sidebarOpen)} 
          congressId={congressId}
          setCongressId={setCongressId}
        />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 px-4 sm:px-6 custom-scrollbar">
          <div className="py-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
