import React from 'react';
import { Users, UserCheck, Crown, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    monthlyGrowth: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: 'green'
    },
    {
      label: 'Premium Users',
      value: stats.premiumUsers.toLocaleString(),
      icon: Crown,
      color: 'purple'
    },
    {
      label: 'Monthly Growth',
      value: `${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                <Icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}