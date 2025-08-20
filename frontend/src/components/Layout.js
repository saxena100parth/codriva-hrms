import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  TicketIcon,
  UserGroupIcon,
  DocumentTextIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
  const { user, logout, isAdmin, isHR, isEmployee } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, show: true },
    { name: 'Employees', href: '/employees', icon: UsersIcon, show: isAdmin || isHR },
    { name: 'Invite Employee', href: '/hr/invite', icon: UserGroupIcon, show: isAdmin || isHR },
    { name: 'Review Onboarding', href: '/hr/review', icon: DocumentTextIcon, show: isAdmin || isHR },
    { name: 'Users', href: '/users', icon: UserCircleIcon, show: isAdmin || isHR },
    { name: 'Create HR', href: '/admin/create-hr', icon: UserCircleIcon, show: isAdmin },
    { name: 'Leaves', href: '/leaves', icon: CalendarIcon, show: true },
    { name: 'Tickets', href: '/tickets', icon: TicketIcon, show: true },
    { name: 'Holidays', href: '/holidays', icon: CalendarIcon, show: true },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon, show: true },
  ].filter(item => item.show);

  const isActive = (path) => location.pathname === path;

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Logo Section */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center mr-3 shadow-lg" style={{ background: '#3b82f6' }}>
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Codriva HRMS</h2>
        </div>
        {mobile && (
          <button
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(item.href)
              ? 'bg-primary-50 text-primary-700 shadow-sm border-l-4 border-primary-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
            onClick={() => mobile && setSidebarOpen(false)}
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
            />
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full ring-2 ring-gray-200"
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff&bold=true&size=64`}
              alt={user?.name}
            />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 logout-btn inline-flex items-center"
            aria-label="Logout"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
            </svg>
            <span className="ml-2 text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 w-full">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-full max-w-xs bg-white shadow-xl flex-shrink-0">
            <SidebarContent mobile={true} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:flex-shrink-0">
          <div className="flex flex-col flex-1 bg-white border-r border-gray-200 shadow-sm">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex flex-col flex-1 w-full min-w-0 ${!isMobile ? 'md:pl-64' : ''}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}

            {/* Page Title */}
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Settings */}
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <Cog6ToothIcon className="h-6 w-6" />
              </button>

              {/* User Avatar - Desktop */}
              {!isMobile && (
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full ring-2 ring-gray-200"
                    src={`https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff&bold=true&size=64`}
                    alt={user?.name}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden lg:block">
                    {user?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 focus:outline-none w-full min-w-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;