import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onLoginClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <header className="bg-white shadow-lg fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-primary-600">HRMS Pro</h1>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <a href="#home" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                            Home
                        </a>
                        <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                            Features
                        </a>
                        <a href="#about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                            About
                        </a>
                        <a href="#contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                            Contact
                        </a>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-gray-700 font-medium">
                                    Welcome, {user?.fullName?.first || 'User'}
                                </span>
                                <button
                                    onClick={logout}
                                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={onLoginClick}
                                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                                >
                                    Login
                                </button>
                                <button className="btn-primary">
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                            <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                                Home
                            </a>
                            <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                                Features
                            </a>
                            <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                                About
                            </a>
                            <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium">
                                Contact
                            </a>
                            <div className="pt-4 space-y-2">
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-3 py-2 text-gray-700 font-medium">
                                            Welcome, {user?.fullName?.first || 'User'}
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={onLoginClick}
                                            className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                                        >
                                            Login
                                        </button>
                                        <button className="btn-primary w-full">
                                            Get Started
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
