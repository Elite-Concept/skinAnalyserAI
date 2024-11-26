
import { Filter } from 'lucide-react';

interface LeadFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export default function LeadFilters({ statusFilter, onStatusChange }: LeadFiltersProps) {
  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-5 h-5 text-gray-400" />
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {statuses.map(status => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}