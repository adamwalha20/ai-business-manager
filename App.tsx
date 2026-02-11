import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Messages from './pages/Messages';
import Products from './pages/Products';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <Orders />;
      case 'messages':
        return <Messages />;
      case 'products':
        return <Products />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-green selection:text-black">
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => {
            setActivePage(page);
            setIsSidebarOpen(false); // Close sidebar on mobile when page changes
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="lg:ml-64 min-h-screen transition-all duration-300">
          {/* Top Bar for Mobile */}
          <div className="lg:hidden h-20 bg-brand-black border-b border-brand-card flex items-center px-4 fixed top-0 w-full z-40">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-white p-2"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 flex justify-center mr-10"> {/* mr-10 to offset the menu button for centering */}
              <span className="text-xl font-bold tracking-wide">
                MR<span className="text-brand-green"> Robot</span>
              </span>
            </div>
          </div>

          <div className="pt-20 lg:pt-0">
            {renderContent()}
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;