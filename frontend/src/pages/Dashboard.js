import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CalendarIcon,
  TicketIcon,
  UserPlusIcon,
  DocumentCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { userService } from '../services/userService';
import { leaveService } from '../services/leaveService';
import { ticketService } from '../services/ticketService';
import { holidayService } from '../services/holidayService';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin, isHR, isEmployee } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdmin || isHR) {
        // Fetch admin/HR stats
        const [userStats, ticketStats, pendingOnboardings, pendingLeaves] = await Promise.all([
          userService.getUserStats(),
          ticketService.getTicketStats(),
          employeeService.getPendingOnboardings(),
          leaveService.getPendingLeaves()
        ]);

        setStats({
          users: userStats.data,
          tickets: ticketStats.data,
          pendingOnboardings: pendingOnboardings.data.length,
          pendingLeaves: pendingLeaves.data.length
        });
      } else {
        // Fetch employee stats
        const [leaveSummary, myTickets, upcomingHolidays] = await Promise.all([
          leaveService.getLeaveSummary(),
          ticketService.getTickets({ page: 1, limit: 5 }),
          holidayService.getUpcomingHolidays(3)
        ]);

        setStats({
          leaves: leaveSummary.data,
          tickets: myTickets.data.tickets,
          holidays: upcomingHolidays.data
        });
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Stat Card Component
  const StatCard = ({ title, value, subtitle, icon: Icon, color = "primary", trend, link }) => (
    <div className="card shadow-hover bg-white p-6 transition-all duration-200 hover:scale-105">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {subtitle && (
              <p className="ml-2 text-sm font-medium text-gray-500">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {trend.value}
            </div>
          )}
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link
            to={link.href}
            className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            {link.text} →
          </Link>
        </div>
      )}
    </div>
  );

  // Quick Action Card Component
  const QuickActionCard = ({ title, subtitle, icon: Icon, href, color = "primary" }) => (
    <Link
      to={href}
      className="card shadow-hover bg-white p-6 transition-all duration-200 hover:scale-105 block"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="gradient-primary rounded-lg p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base">
              Here's what's happening in your HRMS today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-sm opacity-90">
                {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin/HR Dashboard */}
      {(isAdmin || isHR) && (
        <>
          {/* Stats Overview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title="Total Employees"
                value={stats?.users?.byRole?.employee?.total || 0}
                subtitle={`${stats?.users?.byRole?.employee?.active || 0} active`}
                icon={UsersIcon}
                color="blue"
                link={{ href: "/employees", text: "View all employees" }}
              />

              <StatCard
                title="Pending Onboarding"
                value={stats?.pendingOnboardings || 0}
                icon={DocumentCheckIcon}
                color="yellow"
                link={{ href: "/hr/review", text: "Review onboarding" }}
              />

              <StatCard
                title="Pending Leaves"
                value={stats?.pendingLeaves || 0}
                icon={CalendarIcon}
                color="green"
                link={{ href: "/leaves", text: "Review leaves" }}
              />

              <StatCard
                title="Open Tickets"
                value={stats?.tickets?.byStatus?.open || 0}
                icon={TicketIcon}
                color="red"
                link={{ href: "/tickets", text: "View tickets" }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <QuickActionCard
                title="Invite Employee"
                subtitle="Start onboarding process"
                icon={UserPlusIcon}
                href="/hr/invite"
                color="green"
              />

              {isAdmin && (
                <QuickActionCard
                  title="Create HR User"
                  subtitle="Add new HR staff"
                  icon={UsersIcon}
                  href="/admin/create-hr"
                  color="blue"
                />
              )}

              <QuickActionCard
                title="Review Applications"
                subtitle="Check pending requests"
                icon={DocumentCheckIcon}
                href="/hr/review"
                color="yellow"
              />

              <QuickActionCard
                title="Manage Holidays"
                subtitle="Update holiday calendar"
                icon={CalendarIcon}
                href="/holidays"
                color="purple"
              />
            </div>
          </div>
        </>
      )}

      {/* Employee Dashboard */}
      {isEmployee && (
        <>
          {/* Leave Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="card bg-white p-6 text-center">
                <div className="text-sm font-medium text-gray-500 mb-2">Annual Leave</div>
                <div className="text-3xl font-bold text-green-600">
                  {stats?.leaves?.available?.annual || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  of {stats?.leaves?.balance?.annual || 0} available
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.leaves?.available?.annual || 0) / (stats?.leaves?.balance?.annual || 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="card bg-white p-6 text-center">
                <div className="text-sm font-medium text-gray-500 mb-2">Sick Leave</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.leaves?.available?.sick || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  of {stats?.leaves?.balance?.sick || 0} available
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.leaves?.available?.sick || 0) / (stats?.leaves?.balance?.sick || 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="card bg-white p-6 text-center">
                <div className="text-sm font-medium text-gray-500 mb-2">Personal Leave</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.leaves?.available?.personal || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  of {stats?.leaves?.balance?.personal || 0} available
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.leaves?.available?.personal || 0) / (stats?.leaves?.balance?.personal || 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center sm:text-left">
              <Link
                to="/leaves"
                className="btn btn-primary inline-flex items-center"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Apply for Leave
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tickets */}
            <div className="card bg-white">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
                  <Link to="/tickets" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {stats?.tickets?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.tickets.slice(0, 3).map((ticket) => (
                      <div key={ticket._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-full ${ticket.status === 'open' ? 'bg-yellow-100' :
                            ticket.status === 'resolved' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                          {ticket.status === 'open' ? (
                            <ClockIcon className="h-4 w-4 text-yellow-600" />
                          ) : ticket.status === 'resolved' ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                          <p className="text-xs text-gray-500">#{ticket.ticketNumber}</p>
                        </div>
                        <span className={`badge ${ticket.status === 'open' ? 'badge-warning' :
                            ticket.status === 'resolved' ? 'badge-success' : 'badge-danger'
                          }`}>
                          {ticket.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No recent tickets</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Holidays */}
            <div className="card bg-white">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Upcoming Holidays</h3>
                  <Link to="/holidays" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {stats?.holidays?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.holidays.map((holiday) => (
                      <div key={holiday._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 rounded-full bg-blue-100">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {holiday.isOptional && (
                          <span className="badge badge-success">Optional</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No upcoming holidays</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;