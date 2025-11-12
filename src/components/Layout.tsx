import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
// import VoiceAgent from './VoiceAgent'; // Disabled - replaced by AI Chat
import ChatWidget from './ChatWidget';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {/* VoiceAgent disabled - replaced by AI Chat Widget */}
      <ChatWidget />
    </div>
  );
}
