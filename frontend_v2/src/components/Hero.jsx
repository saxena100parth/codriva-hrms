import React from 'react';

const Hero = ({ onLoginClick }) => {
    return (
        <section id="home" className="pt-20 pb-16 bg-gradient-to-br from-primary-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Streamline Your
                        <span className="text-primary-600 block">Human Resources</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        The all-in-one HR management solution that helps you manage employees,
                        track performance, and streamline operations with ease.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onLoginClick}
                            className="btn-primary text-lg px-8 py-4"
                        >
                            Start Free Trial
                        </button>
                        <button className="btn-secondary text-lg px-8 py-4">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Hero Image/Dashboard Preview */}
                <div className="mt-16 relative">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 mx-auto max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-primary-50 rounded-lg p-6">
                                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Management</h3>
                                <p className="text-gray-600">Manage employee profiles, roles, and organizational structure</p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-6">
                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
                                <p className="text-gray-600">Get insights with comprehensive analytics and reporting tools</p>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-6">
                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Tracking</h3>
                                <p className="text-gray-600">Track attendance, hours worked, and manage schedules</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
