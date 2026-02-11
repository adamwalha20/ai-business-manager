import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Messages from './pages/Messages';
import Products from './pages/Products';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

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
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <main className="lg:ml-64 min-h-screen transition-all duration-300">
          {/* Top Bar for Mobile */}
          <div className="lg:hidden h-20 bg-brand-black border-b border-brand-card flex items-center justify-center fixed top-0 w-full z-40">
            <span className="text-xl font-bold tracking-wide">
              MR<span className="text-brand-green"> Robot</span>
            </span>
          </div>

          <div className="pt-0 lg:pt-0">
            {renderContent()}
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;