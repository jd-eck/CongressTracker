import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/home";
import RepresentativeDetail from "@/pages/representative-detail";
import NotFound from "@/pages/not-found";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/representative/:memberId" component={RepresentativeDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <AppFooter />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
