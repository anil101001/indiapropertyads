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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="properties" element={<PropertyListing />} />
            <Route path="property/:id" element={<PropertyDetail />} />
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
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
