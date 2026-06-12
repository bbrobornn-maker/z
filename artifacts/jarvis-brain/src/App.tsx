import { Switch, Route, Router as WouterRouter } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { VaultProvider } from "@/contexts/vault-context";
import { ToastProvider } from "@/components/ui/toast-context";
import Layout from "@/components/layout/layout";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import VaultPage from "@/pages/vault";
import TwoFAPage from "@/pages/two-fa";
import SecurityPage from "@/pages/security";
import HistoryPage from "@/pages/history";
import AuditPage from "@/pages/audit";
import SettingsPage from "@/pages/settings";
import AccountPage from "@/pages/account";
import { CategoryPage } from "@/pages/category-page";

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginPage />;

  return (
    <VaultProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/vault" component={VaultPage} />
          <Route path="/2fa" component={TwoFAPage} />
          <Route path="/emails" component={() => <CategoryPage category="email" />} />
          <Route path="/sites" component={() => <CategoryPage category="site" />} />
          <Route path="/apps" component={() => <CategoryPage category="app" />} />
          <Route path="/servers" component={() => <CategoryPage category="server" />} />
          <Route path="/documents" component={() => <CategoryPage category="document" />} />
          <Route path="/tokens" component={() => <CategoryPage category="token" />} />
          <Route path="/cards" component={() => <CategoryPage category="card" />} />
          <Route path="/identities" component={() => <CategoryPage category="identity" />} />
          <Route path="/notes" component={() => <CategoryPage category="note" />} />
          <Route path="/licenses" component={() => <CategoryPage category="license" />} />
          <Route path="/api-keys" component={() => <CategoryPage category="api_key" />} />
          <Route path="/security" component={SecurityPage} />
          <Route path="/history" component={HistoryPage} />
          <Route path="/audit" component={AuditPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/account" component={AccountPage} />
          <Route component={() => (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="text-5xl mb-4">404</div>
              <p className="text-white/30">Página não encontrada</p>
            </div>
          )} />
        </Switch>
      </Layout>
    </VaultProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WouterRouter>
          <AppContent />
        </WouterRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
