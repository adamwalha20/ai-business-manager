import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Package,
  Settings,
  LogOut,
  Hexagon,
  Maximize,
  Minimize
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', badge: 2 },
    { id: 'products', icon: Package, label: 'Products & Stock' },
    { id: 'settings', icon: Settings, label: 'AI Settings' },
  ];

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return (
    <div className="w-20 lg:w-64 h-screen bg-brand-black border-r border-brand-card flex flex-col justify-between fixed left-0 top-0 z-50 transition-all duration-300">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-brand-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Hexagon size={24} fill="black" className="text-brand-green" />
            </div>
            <span className="hidden lg:block text-xl font-bold tracking-wide">
              MR<span className="text-brand-green"> Robot</span>
            </span>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-2 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${activePage === item.id
                  ? 'bg-brand-card text-brand-green shadow-lg'
                  : 'text-gray-400 hover:bg-brand-card/50 hover:text-white'
                }`}
            >
              <item.icon size={22} className={activePage === item.id ? 'text-brand-green' : 'group-hover:text-brand-orange transition-colors'} />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute right-2 top-2 lg:top-auto lg:right-3 w-2 h-2 lg:w-5 lg:h-5 bg-brand-orange rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                  <span className="hidden lg:inline">{item.badge}</span>
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-3 mb-4 space-y-2">
        <button
          onClick={toggleFullScreen}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-gray-500 hover:bg-brand-card/50 hover:text-white transition-all"
        >
          {isFullScreen ? <Minimize size={22} /> : <Maximize size={22} />}
          <span className="hidden lg:block font-medium">{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</span>
        </button>

        <button className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all">
          <LogOut size={22} />
          <span className="hidden lg:block font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;