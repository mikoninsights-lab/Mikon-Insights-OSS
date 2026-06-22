import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Layout from '@/features/Layout';
import AuthPage from '@/features/auth/AuthPage';
import SimulatorPage from '@/features/simulator/SimulatorPage';
import SaaSSimulatorPage from '@/features/simulator/SaaSSimulatorPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ProjectsPage from '@/features/projects/ProjectsPage';
import ExpensesPage from '@/features/expenses/ExpensesPage';
import ServicesPage from '@/features/services/ServicesPage';
import PipelinePage from '@/features/pipeline/PipelinePage';
import GhostwriterPage from '@/features/ghostwriter/GhostwriterPage';
import AuditLogPage from '@/features/audit/AuditLogPage';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Iniciando sistemas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } 
      />

      <Route 
        path="/simulator" 
        element={
          <ProtectedRoute>
            <SimulatorPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/saas-calculator" 
        element={
          <ProtectedRoute>
            <SaaSSimulatorPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/expenses" 
        element={
          <ProtectedRoute>
            <ExpensesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/services" 
        element={
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/pipeline" 
        element={
          <ProtectedRoute>
            <PipelinePage />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/ghostwriter"
        element={
          <ProtectedRoute>
            <GhostwriterPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit-log"
        element={
          <ProtectedRoute requireAdmin>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors theme="dark" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
