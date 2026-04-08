import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { Landing } from './pages/Landing/Landing';
import { Dashboard } from './pages/Dashboard/Dashboard';

import { Parts } from './pages/Parts/Parts';
import { Tickets } from './pages/Tickets/Tickets';
import { Invoices } from './pages/Invoices/Invoices';

import { ClientPortal } from './pages/ClientPortal/ClientPortal';
import { Preventive } from './pages/Preventive/Preventive';
import { Assets } from './pages/Assets/Assets';
import { Budgets } from './pages/Budgets/Budgets';
import { Subcontractors } from './pages/Subcontractors/Subcontractors';
import { Documents } from './pages/Documents/Documents';

import { Users } from './pages/Users/Users';
import { Blog } from './pages/Blog/Blog';
import { ServicesDetail } from './pages/ServicesDetail/ServicesDetail';
import { Contact } from './pages/Contact/Contact';
import { Login } from './pages/Login/Login';
import { FAQs } from './pages/FAQs/FAQs';
import { PoliticaCookies } from './pages/PoliticaCookies/PoliticaCookies';
import { CookieConsentManager } from './components/CookieConsent/CookieConsentManager';
import { Settings } from './pages/Settings/Settings';

import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccountingProvider } from './context/AccountingContext';
import { BlogProvider } from './context/BlogContext';
import { AssetsProvider } from './context/AssetsContext';
import { TicketsProvider } from './context/TicketsContext';
import { BudgetsProvider } from './context/BudgetsContext';
import { ClientsProvider } from './context/ClientsContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';

import './i18n/config';
import { useAutoTheme } from './hooks/useAutoTheme';
import { FloatingContact } from './components/FloatingWidgets/FloatingContact';
import { WhatsAppButton } from './components/FloatingWidgets/WhatsAppButton';
import { BlogList } from './pages/PublicBlog/BlogList';
import { BlogPost } from './pages/PublicBlog/BlogPost';
import { PublicLayout } from './components/Layout/PublicLayout';
import { GlobalToast } from './components/Feedback/GlobalToast';

function AppContent() {
  useAutoTheme();

  return (
    <>
      <Routes>
        {/* Rutas Públicas - Todas bajo PublicLayout */}
        <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/servicios/:serviceId" element={<PublicLayout><ServicesDetail /></PublicLayout>} />
        <Route path="/contacto" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/faqs" element={<PublicLayout><FAQs /></PublicLayout>} />
        <Route path="/politica-cookies" element={<PublicLayout><PoliticaCookies /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogList /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />

        {/* Portal de Cliente Protegido */}
        <Route path="/portal-cliente" element={
          <ProtectedRoute allowedRoles={['admin', 'client']}>
            <ClientPortal />
          </ProtectedRoute>
        } />

        {/* Aplicación de Administración Protegida */}
        <Route path="/app" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ClientsProvider>
              <AssetsProvider>
                <TicketsProvider>
                  <BudgetsProvider>
                    <AccountingProvider>
                      <AppLayout />
                    </AccountingProvider>
                  </BudgetsProvider>
                </TicketsProvider>
              </AssetsProvider>
            </ClientsProvider>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="partes" element={<Parts />} />
          <Route path="preventivo" element={<Preventive />} />
          <Route path="activos" element={<Assets />} />
          <Route path="tickets" element={<Tickets />} />

          <Route path="facturas" element={<Invoices />} />
          <Route path="presupuestos" element={<Budgets />} />
          <Route path="subcontratas" element={<Subcontractors />} />
          <Route path="documentos" element={<Documents />} />

          <Route path="usuarios" element={<Users />} />
          <Route path="blog" element={<Blog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {/* Widgets flotantes globales */}
      <CookieConsentManager />
      <WhatsAppButton />
      <FloatingContact />
      <GlobalToast />
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BlogProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </BlogProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
