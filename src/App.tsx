import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import PropertyListing from './pages/PropertyListing';
import PropertyDetail from './pages/PropertyDetail';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminPendingProperties from './pages/AdminPendingProperties';
import AdminReports from './pages/AdminReports';
import AdminInsights from './pages/admin/Insights';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import MyProperties from './pages/MyProperties';
import BuyerDashboard from './pages/BuyerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import CRMDashboard from './pages/CRMDashboard';
import LeadDetails from './pages/LeadDetails';
import BuilderRegistration from './pages/BuilderRegistration';
import BuilderDashboard from './pages/BuilderDashboard';
import BuilderProjects from './pages/BuilderProjects';
import AddProject from './pages/AddProject';
import ProjectsListing from './pages/ProjectsListing';
import ProjectInventory from './pages/ProjectInventory';
import TowerInventory from './pages/TowerInventory';
import ProjectPricing from './pages/ProjectPricing';
import ProjectDetail from './pages/ProjectDetail';
import BuilderAnalytics from './pages/BuilderAnalytics';
import DocumentManager from './pages/DocumentManager';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import GoogleAuthCallback from './pages/GoogleAuthCallback';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="properties" element={<PropertyListing />} />
            <Route path="projects" element={<ProjectsListing />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="property/:id" element={<PropertyDetail />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            
            {/* Protected Routes - Buyer */}
            <Route 
              path="buyer-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Owner/Agent */}
            <Route 
              path="owner-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="add-property" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <AddProperty />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-properties" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <MyProperties />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="property/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <EditProperty />
                </ProtectedRoute>
              } 
            />
            
            {/* CRM Routes - Owner/Agent */}
            <Route 
              path="crm" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <CRMDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="crm/leads/:id" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <LeadDetails />
                </ProtectedRoute>
              } 
            />
            
            {/* Builder Routes - Owner/Agent */}
            <Route 
              path="builder/register" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <BuilderRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <BuilderDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder/projects" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <BuilderProjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder/projects/new" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <AddProject />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder/inventory/:projectId" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <ProjectInventory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder/inventory/towers/:towerId" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <TowerInventory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder/pricing/:projectId" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <ProjectPricing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder/analytics" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <BuilderAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="builder/documents" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'agent']}>
                  <DocumentManager />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Agent */}
            <Route 
              path="agent-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Admin */}
            <Route 
              path="admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin-pending-properties" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPendingProperties />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin-reports" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin-insights" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminInsights />
                </ProtectedRoute>
              } 
            />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </AuthProvider>
      <PWAInstallPrompt />
    </Router>
  );
}

export default App;
