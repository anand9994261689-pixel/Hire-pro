import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tags, UploadCloud, FileText, LogOut } from 'lucide-react';
import { AppContext } from '../App';

const Sidebar = () => {
  const { user, logout } = useContext(AppContext);
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Upload & Analyze', path: '/upload', icon: UploadCloud },
    { name: 'Results', path: '/results', icon: FileText },
  ];

  return (
    <div className="w-64 h-screen bg-surface border-r border-gray-800 flex flex-col p-4 fixed left-0 top-0 z-30 justify-between">
      <div>
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand-dark mb-8 p-2">
          CandiMind AI
        </div>
        
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-brand/20 text-brand-light shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-800 pt-4 mt-auto flex flex-col gap-3">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-800/40 rounded-xl border border-gray-800/60">
            <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-brand-light font-bold">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <p className="text-sm font-semibold text-gray-200 truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 font-medium w-full text-left"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
