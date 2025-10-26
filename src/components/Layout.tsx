import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import VoiceAgent from './VoiceAgent';

export default function Layout() {
  const location = useLocation();
  
  // Determine context based on current route
  const getContext = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/property')) return 'property';
    if (location.pathname === '/properties') return 'listing';
    if (location.pathname === '/agent-dashboard') return 'agent';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'home';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <VoiceAgent context={getContext()} />
    </div>
  );
}
