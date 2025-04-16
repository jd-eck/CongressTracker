import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MyPreferences from "@/pages/MyPreferences";
import About from "@/pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/preferences" component={MyPreferences} />
      <Route path="/about" component={About} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Router />
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
