import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Vaults from "@/pages/vaults";
import Vault from "@/pages/vault";
import NotePage from "@/pages/note";
import GraphPage from "@/pages/graph";
import SearchPage from "@/pages/search";
import SiispPage from "@/pages/siisp";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vaults" component={Vaults} />
      <Route path="/vaults/:vaultId" component={Vault} />
      <Route path="/notes/:noteId" component={NotePage} />
      <Route path="/graph" component={GraphPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/siisp" component={SiispPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/+$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
