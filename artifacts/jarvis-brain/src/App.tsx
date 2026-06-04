import { Switch, Route, Router as WouterRouter, useLocation, useRoute } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Vaults from "@/pages/vaults";
import Vault from "@/pages/vault";
import NotePage from "@/pages/note";
import GraphPage from "@/pages/graph";
import SearchPage from "@/pages/search";
import SiispPage from "@/pages/siisp";
import LoginPage from "@/pages/login";
import PeriCredPage from "@/pages/pericred";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
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
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/+$/, "")}>
            <AppContent />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const [isPericred] = useRoute("/");
  const [isLogin] = useRoute("/login");
  const { isAuthenticated } = useAuth();

  // Rota publica: PeriCred (painel falso)
  if (isPericred) {
    return <PeriCredPage />;
  }

  // Rota publica: Login OU nao autenticado (fullscreen sem layout)
  if (isLogin || !isAuthenticated) {
    return <LoginPage />;
  }

  // Rotas protegidas (brain) - com layout sidebar
  return (
    <Layout>
      <Router />
    </Layout>
  );
}

export default App;
