import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import leaveService from '../services/leaveService';
import ticketService from '../services/ticketService';
import holidayService from '../services/holidayService';

const Dashboard = () => {
    const { user, hasRole, hasAnyRole } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        userStats: null,
        leaveStats: null,
        ticketStats: null,
        upcomingHolidays: [],
        recentLeaves: [],
        recentTickets: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);

            // Load different data based on user role
            const promises = [];

            // All users get their basic stats
            promises.push(userService.getUserDashboard());
            promises.push(leaveService.getLeaveBalance());
            promises.push(holidayService.getUpcomingHolidays(5));

            // Admin/HR get additional stats
            if (hasAnyRole(['ADMIN', 'HR'])) {
                promises.push(leaveService.getLeaveStats());
                promises.push(ticketService.getTicketStats());
                promises.push(leaveService.getPendingApprovals());
            }

            // Employees get their recent data
            if (hasRole('EMPLOYEE')) {
                promises.push(leaveService.getMyLeaves({ limit: 5 }));
                promises.push(ticketService.getMyTickets({ limit: 5 }));
            }

            const results = await Promise.allSettled(promises);

            // Process results and update state
            const newData = { ...dashboardData };

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const data = result.value;

                    switch (index) {
                        case 0: // User dashboard
                            newData.userStats = data;
                            break;
                        case 1: // Leave balance
                            newData.leaveBalance = data;
                            break;
                        case 2: // Upcoming holidays
                            newData.upcomingHolidays = data;
                            break;
                        case 3: // Leave stats (Admin/HR)
                            if (hasAnyRole(['ADMIN', 'HR'])) {
                                newData.leaveStats = data;
                            }
                            break;
                        case 4: // Ticket stats (Admin/HR)
                            if (hasAnyRole(['ADMIN', 'HR'])) {
                                newData.ticketStats = data;
                            }
                            break;
                        case 5: // Pending approvals (Admin/HR)
                            if (hasAnyRole(['ADMIN', 'HR'])) {
                                newData.pendingApprovals = data;
                            }
                            break;
                        case 6: // Recent leaves (Employee)
                            if (hasRole('EMPLOYEE')) {
                                newData.recentLeaves = data.leaves || [];
                            }
                            break;
                        case 7: // Recent tickets (Employee)
                            if (hasRole('EMPLOYEE')) {
                                newData.recentTickets = data.tickets || [];
                            }
                            break;
                    }
                }
            });

            setDashboardData(newData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {user?.fullName?.first || 'User'}!
                            </h1>
                            <p className="text-gray-600">
                                {user?.role === 'ADMIN' ? 'Administrator' :
                                    user?.role === 'HR' ? 'Human Resources' :
                                        'Employee'} Dashboard
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Employee ID</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {user?.employeeId || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Leave Balance Card */}
                    {dashboardData.leaveBalance && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Leave Balance</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {dashboardData.leaveBalance.annual || 0} days
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Department Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Department</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {user?.department || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Job Title Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Job Title</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {user?.jobTitle || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {user?.status || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Holidays */}
                {dashboardData.upcomingHolidays.length > 0 && (
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Upcoming Holidays</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {dashboardData.upcomingHolidays.map((holiday, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{holiday.name}</p>
                                            <p className="text-sm text-gray-500">{holiday.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(holiday.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Leaves */}
                    {dashboardData.recentLeaves.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Recent Leave Requests</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {dashboardData.recentLeaves.map((leave, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{leave.leaveType}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Tickets */}
                    {dashboardData.recentTickets.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Recent Support Tickets</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {dashboardData.recentTickets.map((ticket, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{ticket.subject}</p>
                                                <p className="text-sm text-gray-500">{ticket.category}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
