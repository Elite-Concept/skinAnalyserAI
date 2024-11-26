import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, CreditCard, BarChart3, Search, Filter, Download } from 'lucide-react';
import UserTable from '../components/admin/UserTable';
import DashboardStats from '../components/admin/DashboardStats';
import UserFilters from '../components/admin/UserFilters';
import { useAdmin } from '../hooks/useAdmin';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Mock statistics for demonstration
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    premiumUsers: 456,
    monthlyGrowth: 12.5
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const handleExportData = () => {
    // Implement CSV export functionality
    console.log('Exporting data...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and monitor system activity
          </p>
        </div>

        <DashboardStats stats={stats} />

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <UserFilters
                  statusFilter={statusFilter}
                  planFilter={planFilter}
                  onStatusChange={setStatusFilter}
                  onPlanChange={setPlanFilter}
                />

                <button
                  onClick={handleExportData}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <UserTable
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            planFilter={planFilter}
          />
        </div>
      </div>
    </div>
  );
}