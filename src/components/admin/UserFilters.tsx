import React from 'react';
import { Filter } from 'lucide-react';

interface UserFiltersProps {
  statusFilter: string;
  planFilter: string;
  onStatusChange: (status: string) => void;
  onPlanChange: (plan: string) => void;
}

export default function UserFilters({
  statusFilter,
  planFilter,
  onStatusChange,
  onPlanChange
}: UserFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <select
        value={planFilter}
        onChange={(e) => onPlanChange(e.target.value)}
        className="border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Plans</option>
        <option value="free">Free</option>
        <option value="basic">Basic</option>
        <option value="premium">Premium</option>
      </select>
    </div>
  );
}